// 全域變數
const orderListBody = document.querySelector('.orderListBody');

// 取得訂單列表
let orderData = [];
function getOrderList() {
    axios.get(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            // console.log(response.data.orders);
            orderData = response.data.orders;
            // console.log(orderData);
            renderOrderList();
            // renderC3();
            renderC3_lv2();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 初始化
function init() {
    getOrderList();
}
init();

// 渲染訂單列表
function renderOrderList() {
    let str = "";
    orderData.forEach(function (item) {
        // 組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        let orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

        // 組訂單產品字串        
        let productItemStr = "";
        item.products.forEach(function (productItem) {
            // console.log(productItem);
            productItemStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        })

        // 處理訂單狀態：未處理 / 已處理
        let orderStatus = "";
        if (item.paid == true) {
            orderStatus = "已處理";
        } else {
            orderStatus = "未處理";
        }

        // 組訂單列表字串
        // console.log(item);
        str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            <p>${productItemStr}</p>
                        </td>
                        <td>${orderTime}</td>
                        <td class="orderStatus">
                            <a href="#" class="js-orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                        </td>
                    </tr>`;

    })
    orderListBody.innerHTML = str;
}

// 監聽訂單列表點擊事件
orderListBody.addEventListener('click', function (e) {
    e.preventDefault();
    let targetClass = e.target.getAttribute('class');
    let id = e.target.getAttribute('data-id');
    if (targetClass == "delSingleOrder-Btn") {
        console.log(id);
        deleteOrderItem(id);
        return; // 中斷程式
    }

    if (targetClass == "js-orderStatus") {
        // console.log('點擊到訂單狀態');        
        let status = e.target.getAttribute('data-status');
        // console.log(id, typeof id, status, typeof status);
        changeOrderStatus(id, status);
        return; // 中斷程式
    }
})

// 修改訂單狀態功能
function changeOrderStatus(id, status) {
    let newStatus;
    // console.log(status == "true");
    if (status == "true") {
        newStatus = false;
        // console.log('change to', newStatus);
    } else {
        newStatus = true;
        // console.log('change to', newStatus);
    }

    axios.put(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            console.log(response.data.orders);
            alert('修改訂單狀態成功！');
            getOrderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 刪除指定訂單
function deleteOrderItem(orderId) {
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            console.log(response.data.orders);
            alert('刪除指定訂單成功！');
            getOrderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 刪除全部訂單
// 監聽刪除全部按鈕
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    deleteAllOrder();
})
function deleteAllOrder() {
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            console.log(response.data.orders);
            alert('刪除全部訂單成功！');
            getOrderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 圖表 C3.js
function renderC3() {
    // 物件資料蒐集
    // console.log(orderData);
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productsItem) {
            if (total[productsItem.category] == undefined) {
                total[productsItem.category] = (productsItem.price) * (productsItem.quantity);
            } else {
                total[productsItem.category] += (productsItem.price) * (productsItem.quantity);
            }
        })
    })
    // console.log(total);

    // 做出資料關聯
    let categoryAry = Object.keys(total);
    // console.log(categoryAry);
    let newData = [];
    categoryAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        // console.log(ary);
        newData.push(ary);
    })
    // console.log(newData);

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors: {
                "床架": "#DACBFF",
                "收納": "#9D7FEA",
                "窗簾": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

// [
//     ['收納', 4560],
//     ['床架', 21780],
//     ['窗簾', 3600]
// ]


function renderC3_lv2() {
    // 資料蒐集
    let total = {};
    orderData.forEach(function (item) {
        // console.log(item);
        item.products.forEach(function (productitem) {
            // console.log(productitem);
            if (total[productitem.title] == undefined) {
                total[productitem.title] = productitem.price * productitem.quantity;
            } else {
                total[productitem.title] += productitem.price * productitem.quantity;
            }
        })
    })
    // console.log(total);
    // output {'Charles 系列儲物組合': 780, 'Louvre 單人床架': 3780, 'Antony 遮光窗簾': 3600, 'Antony 床邊桌': 3780, 'Louvre 雙人床架／雙人加大': 18000}

    // 拉出資料關聯
    let originAry = Object.keys(total);
    // console.log(originAry);
    // output ['Charles 系列儲物組合', 'Louvre 單人床架', 'Antony 遮光窗簾', 'Antony 床邊桌', 'Louvre 雙人床架／雙人加大']

    // 處理資料 (C3.js格式)
    let rankSortAry = [];
    originAry.forEach(function (item) {
        // console.log(item);
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        rankSortAry.push(ary);
    })
    console.log(rankSortAry);
    // 0: (2) ['Charles 系列儲物組合', 780]
    // 1: (2) ['Louvre 單人床架', 3780]
    // 2: (2) ['Antony 遮光窗簾', 3600]
    // 3: (2) ['Antony 床邊桌', 3780]
    // 4: (2) ['Louvre 雙人床架／雙人加大', 18000]

    // sort 排序
    // 比大小，降冪排列（目的：取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊）
    rankSortAry.sort(function (a, b) {
        return b[1] - a[1];
    })
    // 0: (2) ['Louvre 雙人床架／雙人加大', 18000]
    // 1: (2) ['Louvre 單人床架', 3780]
    // 2: (2) ['Antony 床邊桌', 3780]
    // 3: (2) ['Antony 遮光窗簾', 3600]
    // 4: (2) ['Charles 系列儲物組合', 780]

    // 判斷是否超過四筆
    // 如果筆數超過四筆以上，就統整為「其他」
    if (rankSortAry.length > 3) {
        let otherTotal = 0;
        rankSortAry.forEach(function (item, index) {
            if (index > 2) {
                otherTotal += rankSortAry[index][1];
            }
        })
        // console.log(otherTotal);
        rankSortAry.splice(3, rankSortAry.length - 1);
        // console.log(rankSortAry);
        rankSortAry.push(['其他', otherTotal]);
        // console.log(rankSortAry);
    }

    // 顯示圖表
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
            colors: {
                pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F",]
            }
        },
    });
}