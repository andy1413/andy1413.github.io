---
title: iOS StoreKit2新特性
author: andy
date: 2023-02-01 20:30:00 +0800
categories: [iOS应用]
tags: [iOS架构, Swift5.5, 异步并发, IAP, 内购]
---

## 1. 客户端相关：

&emsp;1. 使用iOS15以上可用的Swift异步并发API进行开发，代码可以做到最简洁。

&emsp;2. 使用JWS来校验订单，不需要服务器进行验票，客户端直接就能拿到支付成功后的订单。

&emsp;关键代码如下：
```swift
//根据productId获取product
products = try await Product.products(for: Set(productIds))

//product.type可获取订阅类型
product.type == .autoRenewable

//获取autoRenewable是否是第一次购买优惠
product.subscription?.isEligibleForIntroOffer

//支付，可以传入userid+orderid组合的uuid用来关联指定用户的订单。
let uuid = Product.PurchaseOption.appAccountToken(UUID.init(uuidString: "userid+orderid")!)
let result = try await product.purchase(options: [uuid])

//处理支付结果，此时苹果内部已经进行了JWS校验
switch result {
    case .success(let verificationResult):
        //处理成功
        if case .verified(let transaction) = verificationResult {
            //transaction.appAccountToken可以拿到支付时传入的uuid
            
            //在这里给服务器上传transaction.id、transaction.originalID服务器就可以去苹果服务器请求订单信息了。
            
            await transaction.finish()
        } else {
            throw verifyFailure
        }
    case .userCancelled:
        //处理取消
    case .pending:
        //交易可能会在未来成功，通过Transaction.updates进行通知。
}

//获取当前所有订阅记录
for await result in Transaction.currentEntitlements {
    if case .verified(let transaction) = result {
        
    }
}

//可以在应用内部弹出管理订阅的窗口了
try await AppStore.showManageSubscriptions(in: scene)

//应用内可以请求退款了，沙盒也可以测试退款。
try await transaction.beginRefundRequest(in: scene)

//Transaction.updates, 当网络不好支付结果返回.pending或者用户购买时退出了app或卸载重装，在这里会获得回调。
Task.detached {
    for await verificationResult in Transaction.updates {
        if case .verified(let transaction) = verificationResult {
            //在这里给服务器上传transaction.id、transaction.originalID服务器就可以去苹果服务器请求订单信息了。
            
            await transaction.finish()
        }
    }
}

//获取全部交易订单
Transaction.all

//获取某个产品最新交易订单
Transaction.latest(for: productId)

//获取所有当前订阅的交易
Transaction.currentEntitlements

//获取某个产品当前订阅的交易
Transaction.currentEntitlement(for: productId)

//同步不同设备之间的应用内购买（恢复购买）
try await AppStore.sync()

//内购对兑码 当服务器出问题了，为了挽留用户或吸引更多用户，
//可以给用户邮箱发送内购对兑码，让用户在app内进行兑换。非新功能。
SKPaymentQueue.default().presentCodeRedemptionSheet()
```

## 2. 服务器相关：

&emsp;1. 服务器API接口汇总：https://developer.apple.com/documentation/appstoreserverapi

&emsp;2. 服务器可以主动去苹果服务器查询订阅状态及交易历史记录。

&emsp;&emsp;1. get_all_subscription_statuses: /inApps/v1/subscriptions 根据originalTransactionId获取购买交易信息及所有续订信息。

&emsp;&emsp;2. get_transaction_history:  inApps/v1/history/ 根据originalTransactionId分页获取购买交易信息

&emsp;&emsp;（不包含续订信息，如果需要续订信息，当从交易信息中拿到是订阅类型的，再调用get_all_subscription_statuses接口去拿续订信息。如果能开始时就确定是订阅类型的，可以不调用此接口，直接调用get_all_subscription_statuses去获取所有数据）

&emsp;3. 可以根据订单ID去苹果服务器查询交易信息。https://developer.apple.com/documentation/appstoreserverapi/look_up_order_id?language=_9

&emsp;&emsp;用户扣款后没有收到商品，会找到咱们的客服进行反馈，附带苹果邮箱里的扣款截图，咱们服务器就可以根据截图里的orderID去调用/inApps/v1/lookup/{customer_order_id}接口查找对应的Transaction信息，根据信息确定是否要补发商品。

![图1](/assets/img/posts/StoreKit2_image1.png)

&emsp;4. 接收内购状态改变通知，通知有删除有新增：

![图2](/assets/img/posts/StoreKit2_image2.png)

&emsp;5. 购买流程有变化：

&emsp;&emsp;订阅类型：

&emsp;&emsp;&emsp;苹果服务器会通知我们的服务器

&emsp;&emsp;&emsp;我们也可以根据客户端上报的originalTransactionId调用/inApps/v1/subscriptions 接口去验证。

![图3](/assets/img/posts/StoreKit2_image3.png)

&emsp;6. 总体购买流程：

![图4](/assets/img/posts/StoreKit2_image4.png)

&emsp;7. 服务器可以主动查询退款订单详情。

&emsp;&emsp;如果服务器宕机了或者没有收到退款通知，服务器可以调用API主动查询用户所有退款记录订单，只需要任意一个original_transaction_id。

&emsp;&emsp;[Apple Developer Documentation](https://developer.apple.com/documentation/appstoreserverapi/get_refund_history/) inApps/v2/refund/lookup/{originalTransactionId}

&emsp;8. 给用户补偿订阅时长。

&emsp;&emsp;如果某个原因设计的活动中断了或取消了，可以给用户一些福利去安抚用户。

&emsp;&emsp;Apple提供了一个API，允许一年有2次机会给订阅用户每次加90天免费补偿。

&emsp;&emsp;[Apple Developer Documentation](https://developer.apple.com/documentation/appstoreserverapi/extend_a_subscription_renewal_date/)  inApps/v1/subscription/extend/{original_transaction_id

## 3. StoreKit2 丢单处理：

&emsp;还是有可能出现丢单的情况，例如购买成功了，Apple 返回结果时由于网络的原因导致失败了，但是此时会更容易解决。

&emsp;解决办法：

&emsp;&emsp;冷启动时，可监听 Transaction 变化，收到成功的 Transaction 后重新上传，与 StoreKit 1 类似。

&emsp;&emsp;在购买时向 product 内 appAccountToken 字段里塞入业务方 orderID 相关的信息，当用户反馈扣款了但是没发货时，可以让用户提供 Apple 的 orderID，通过它可以直接去苹果服务器获取对应的 Transaction 信息，找到 Transaction.appAccountToken ，再给用户发货。(这里可以做成一个自动化处理工具，只需要用户提供苹果的 orderID，就可以去查找对应的业务方 orderID 进行发货。)

## 4. 参考文章：

&emsp;[StoreKit2 有这么香？嗯，我试过了，真香 - 掘金 ](https://juejin.cn/post/7023974581446639630)

&emsp;[iOS StoreKit 2 新特性解析-51CTO.COM](https://www.51cto.com/article/708077.html)

## 5. 有任何问题欢迎评论区留言进行探讨。
