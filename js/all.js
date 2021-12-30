// 全域變數
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const shoppingCartTableBody = document.querySelector('.shoppingCart-tableBody');

// productDisplay
// 取得產品列表
let productData = [];
function getProductList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/products`)
        .then(function (response) {
            productData = response.data.products;
            // console.log(productData);
            renderProduct("全部");
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 渲染產品列表
function renderProduct(select) {
    let str = "";
    productData.forEach(function (productItem) {
        if (select == "全部") {
            str += productString(productItem);
        }
        else if (select == `${productItem.category}`) {
            str += productString(productItem);
        }
    })
    productWrap.innerHTML = str;
}

// 組字串
function productString(item) {
    content = `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}"
                alt="">
            <a href="#" class="addCardBtn" data-productId="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
        </li>`;
    return content;
}

// 產品篩選
// 監聽 productSelect 的 change 事件
productSelect.addEventListener('change', function (e) {
    e.preventDefault();
    renderProduct(e.target.value);
})

// 購物車
// 取得購物車 get
let cartData = [];
let totalPrice;
function getCartList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            // console.log(response.data);
            cartData = response.data.carts;
            // console.log(cartData);
            renderCart();

            // 取得購物車總金額
            totalPrice = toThousands(response.data.finalTotal);
            const cartTotal = document.querySelector('.js-total');
            cartTotal.textContent = totalPrice;
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 初始化
function init() {
    getProductList();
    getCartList();
}
init();

// 渲染購物車
function renderCart() {
    let str = "";
    cartData.forEach(function (item) {
        // console.log(item);        
        str += `
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${toThousands(item.product.price)}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                    <td class="discardBtn">
                        <a href="#" data-cartId="${item.id}" class="material-icons">
                            clear
                        </a>
                    </td>
                </tr>`;
    })
    shoppingCartTableBody.innerHTML = str;
}

// 監聽加入購物車按鈕點擊
productWrap.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.getAttribute('class') !== "addCardBtn") {
        // console.log('沒點到按鈕');
        return; // 中斷程式
    }
    let productId = e.target.getAttribute('data-productId');

    // 判斷購物車中該品項是否已存在：if 不存在 -> 數量賦予 1 的值 / if 已存在 -> 取得原數量 +1
    let numCheck = 1;
    cartData.forEach(function (item) {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        }
    })
    // console.log(numCheck);
    addCartItem(productId, numCheck);
})

// 加入購物車品項 post 
function addCartItem(productId, quantity) {
    axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": quantity
        }
    })
        .then(function (response) {
            // console.log(response.data);
            alert('加入購物車成功！');
            getCartList();
        })
        .catch(function (error) {
            console.log(error);
        })
}


// 刪除購物車指定品項
// 監聽刪除品項按鈕
shoppingCartTableBody.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.getAttribute('class') === null || e.target.getAttribute('class') === "discardBtn") {
        console.log("沒有點到刪除按鈕");
        return; // 中斷程式
    }
    let cartId = e.target.getAttribute('data-cartId');
    deleteCartItem(cartId);
})

function deleteCartItem(cartId) {
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(function (response) {
            console.log(response.data);
            alert('刪除品項成功！');
            getCartList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 刪除所有品項
// 監聽刪除全部按鈕點擊事件
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    deleteCartAll();
})

function deleteCartAll() {
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            console.log(response.data);
            alert('購物車產品已全部清空！');
            getCartList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const customertradeWay = document.querySelector('#tradeWay');
const orderInfoForm = document.querySelector('.orderInfo-form');

// 監聽送出訂單按鈕點擊事件
orderInfoBtn.addEventListener('click', function (e) {
    e.preventDefault();
    // 防止購物車是空的送出訂單
    if (cartData.length == 0) {
        alert('請將商品加入購物車');
        return; // 中斷程式
    }
    // 防止表單填寫不全送出訂單
    if (customerName.value == "" || customerPhone.value == "" || customerEmail.value == "" || customerAddress.value == "" || customertradeWay.value == "") {
        alert('請填寫完整資料歐～');
        return; // 中斷程式
    }
    addOrders(customerName.value, customerPhone.value, customerEmail.value, customerAddress.value, customertradeWay.value);
    orderInfoForm.reset(); // 清空表單輸入框
})

// 送出訂單 post
function addOrders(name, tel, email, address, payment) {
    axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": name,
                "tel": tel,
                "email": email,
                "address": address,
                "payment": payment
            }
        }
    })
        .then(function (response) {
            console.log(response.data);
            alert('送出訂單成功！');
            getCartList();
        })
        .catch(function (error) {
            console.log(error);
        })

}


// util js
function toThousands(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}