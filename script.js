// ใส่ URL ของ Google Apps Script Web App หลัง Deploy ที่ตัวแปรนี้
const GOOGLE_SCRIPT_URL = "ใส่_URL_GOOGLE_APPS_SCRIPT_ที่นี่";

const products = {
  MS001: { name: "Milk Soft Soap", price: 89 },
  MS002: { name: "Honey Glow Soap", price: 99 }
};

const form = document.getElementById("orderForm");
const skuSelect = document.getElementById("skuSelect");
const quantityInput = form.elements.quantity;
const totalPrice = document.getElementById("totalPrice");
const message = document.getElementById("formMessage");

function updateTotal() {
  const item = products[skuSelect.value];
  const qty = Math.max(1, Number(quantityInput.value) || 1);
  totalPrice.textContent = "฿" + (item.price * qty).toLocaleString("th-TH");
}
skuSelect.addEventListener("change", updateTotal);
quantityInput.addEventListener("input", updateTotal);

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    skuSelect.value = button.dataset.sku;
    updateTotal();
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  });
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const product = products[data.sku];
  const quantity = Number(data.quantity);
  const order = {
    orderId: "MS" + Date.now(),
    createdAt: new Date().toISOString(),
    customerName: data.customerName.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    postcode: data.postcode.trim(),
    sku: data.sku,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity,
    status: "รอจัดเตรียมสินค้า"
  };

  if (!/^\d{5}$/.test(order.postcode)) {
    message.textContent = "กรุณากรอกรหัสไปรษณีย์ 5 หลัก";
    return;
  }

  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "กำลังบันทึกคำสั่งซื้อ…";
  message.textContent = "";

  try {
    if (!GOOGLE_SCRIPT_URL.startsWith("https://")) {
      throw new Error("ยังไม่ได้ตั้งค่า Google Apps Script URL");
    }
    // ส่งเป็น text/plain เพื่อลดปัญหา CORS preflight
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(order)
    });
    message.textContent = "ส่งคำสั่งซื้อแล้ว กรุณารอร้านค้าติดต่อยืนยัน";
    form.reset();
    updateTotal();
  } catch (error) {
    message.textContent = "ยังส่งข้อมูลไม่ได้: " + error.message + " (ตรวจสอบ URL และสิทธิ์การ Deploy)";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'ยืนยันคำสั่งซื้อ <span>→</span>';
  }
});
