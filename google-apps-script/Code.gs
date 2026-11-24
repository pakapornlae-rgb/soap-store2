const SHEET_NAME = "Orders";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "เลขคำสั่งซื้อ", "วันที่สั่งซื้อ", "ชื่อผู้รับ", "เบอร์โทร",
        "ที่อยู่", "รหัสไปรษณีย์", "SKU", "สินค้า", "จำนวน",
        "ราคาต่อชิ้น", "ยอดรวม", "สถานะ"
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.orderId, new Date(data.createdAt), data.customerName, data.phone,
      data.address, data.postcode, data.sku, data.productName,
      Number(data.quantity), Number(data.unitPrice), Number(data.total), data.status
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Mellow Soap order endpoint is running.");
}