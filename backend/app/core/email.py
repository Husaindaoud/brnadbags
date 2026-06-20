import resend as _resend
from .config import get_settings


def send_order_notification(order, notification_emails: str):
    settings = get_settings()
    if not settings.resend_api_key:
        return
    emails = [e.strip() for e in notification_emails.split(",") if e.strip()]
    if not emails:
        return

    _resend.api_key = settings.resend_api_key

    rows = "".join(
        f"<tr style='border-bottom:1px solid #f0ece6'>"
        f"<td style='padding:10px 12px'>{item.product_name}</td>"
        f"<td style='padding:10px 12px;text-align:center'>{item.quantity}</td>"
        f"<td style='padding:10px 12px;text-align:right'>${item.price:.2f}</td>"
        f"</tr>"
        for item in order.items
    )

    notes_block = (
        f"<p style='margin:16px 0 0'><strong>Notes:</strong> {order.order_notes}</p>"
        if order.order_notes else ""
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1a1a1a;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:0.1em">NEW ORDER</h1>
        <p style="color:#b8966a;margin:4px 0 0;font-size:13px">#{order.order_ref}</p>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:15px;margin:0 0 16px;color:#555;letter-spacing:0.08em;text-transform:uppercase">Customer</h2>
        <p style="margin:4px 0"><strong>{order.first_name} {order.last_name}</strong></p>
        <p style="margin:4px 0;color:#555">📞 {order.phone}</p>
        {"<p style='margin:4px 0;color:#555'>✉️ " + order.email + "</p>" if order.email else ""}
        <p style="margin:4px 0;color:#555">📍 {order.street_address}{", " + order.apartment if order.apartment else ""}, {order.city}, {order.country}</p>
        {notes_block}

        <h2 style="font-size:15px;margin:28px 0 12px;color:#555;letter-spacing:0.08em;text-transform:uppercase">Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f8f6f2">
              <th style="padding:10px 12px;text-align:left;font-weight:600">Product</th>
              <th style="padding:10px 12px;text-align:center;font-weight:600">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600">Price</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>

        <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #1a1a1a">
          <span style="font-size:18px;font-weight:700">Total: ${order.total:.2f}</span>
        </div>
      </div>
      <div style="background:#f8f6f2;padding:16px 32px;text-align:center;font-size:12px;color:#a8a29e">
        Brand Bags &amp; More — Admin Notification
      </div>
    </div>
    """

    try:
        _resend.Emails.send({
            "from": settings.email_from,
            "to": emails,
            "subject": f"New Order #{order.order_ref} — {order.first_name} {order.last_name}",
            "html": html,
        })
    except Exception as e:
        print(f"[email] Failed to send order notification: {e}")
