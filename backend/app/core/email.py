import logging
from html import escape
import resend as _resend
from .config import get_settings

# uvicorn's logger writes unbuffered to stderr, so these show up in Railway logs
log = logging.getLogger("uvicorn.error")


def send_order_notification(order, notification_emails: str):
    settings = get_settings()
    if not settings.resend_api_key:
        log.warning("[email] RESEND_API_KEY is not set — skipping admin notification for #%s", order.order_ref)
        return
    emails = [e.strip() for e in notification_emails.split(",") if e.strip()]
    if not emails:
        log.warning("[email] No notification emails configured — skipping admin notification for #%s", order.order_ref)
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
        result = _resend.Emails.send({
            "from": settings.email_from,
            "to": emails,
            "subject": f"New Order #{order.order_ref} — {order.first_name} {order.last_name}",
            "html": html,
        })
        log.info("[email] Admin notification for #%s sent to %s (resend id %s)",
                 order.order_ref, emails, (result or {}).get("id"))
    except Exception as e:
        log.error("[email] Failed to send admin notification for #%s from %s: %s",
                  order.order_ref, settings.email_from, e)


def send_customer_confirmation(order, whatsapp_number: str = ""):
    settings = get_settings()
    if not order.email:
        return
    if not settings.resend_api_key:
        log.warning("[email] RESEND_API_KEY is not set — skipping customer confirmation for #%s", order.order_ref)
        return

    _resend.api_key = settings.resend_api_key

    rows = "".join(
        f"<tr style='border-bottom:1px solid #f0ece6'>"
        f"<td style='padding:10px 12px'>{escape(item.product_name)}</td>"
        f"<td style='padding:10px 12px;text-align:center'>{item.quantity}</td>"
        f"<td style='padding:10px 12px;text-align:right'>${item.price * item.quantity:.2f}</td>"
        f"</tr>"
        for item in order.items
    )

    discount_block = (
        f"<p style='margin:4px 0;color:#555'>Discount"
        f"{' (' + escape(order.promo_code) + ')' if order.promo_code else ''}: "
        f"−${order.discount_amount:.2f}</p>"
        if order.discount_amount else ""
    )

    wa_digits = "".join(c for c in (whatsapp_number or "") if c.isdigit())
    contact_block = (
        f"<p style='margin:24px 0 0;font-size:14px;color:#555'>Questions about your order? "
        f"<a href='https://wa.me/{wa_digits}' style='color:#b8966a'>Message us on WhatsApp</a>.</p>"
        if wa_digits else ""
    )

    address = escape(order.street_address)
    if order.apartment:
        address += ", " + escape(order.apartment)
    address += f", {escape(order.city)}, {escape(order.country)}"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1a1a1a;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:0.1em">THANK YOU FOR YOUR ORDER</h1>
        <p style="color:#b8966a;margin:4px 0 0;font-size:13px">Order #{escape(order.order_ref)}</p>
      </div>
      <div style="padding:32px">
        <p style="margin:0 0 16px">Hi {escape(order.first_name)},</p>
        <p style="margin:0 0 16px;color:#555">We've received your order and will contact you shortly to confirm delivery.</p>

        <h2 style="font-size:15px;margin:28px 0 12px;color:#555;letter-spacing:0.08em;text-transform:uppercase">Your Items</h2>
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
          {discount_block}
          <span style="font-size:18px;font-weight:700">Total: ${order.total:.2f}</span>
        </div>

        <h2 style="font-size:15px;margin:28px 0 12px;color:#555;letter-spacing:0.08em;text-transform:uppercase">Delivery Address</h2>
        <p style="margin:4px 0;color:#555">{address}</p>
        <p style="margin:4px 0;color:#555">{escape(order.phone)}</p>
        {contact_block}
      </div>
      <div style="background:#f8f6f2;padding:16px 32px;text-align:center;font-size:12px;color:#a8a29e">
        Brand Bags &amp; More
      </div>
    </div>
    """

    try:
        result = _resend.Emails.send({
            "from": settings.email_from,
            "to": [order.email],
            "subject": f"Your order #{order.order_ref} is confirmed — Brand Bags & More",
            "html": html,
        })
        log.info("[email] Customer confirmation for #%s sent (resend id %s)",
                 order.order_ref, (result or {}).get("id"))
    except Exception as e:
        log.error("[email] Failed to send customer confirmation for #%s from %s: %s",
                  order.order_ref, settings.email_from, e)
