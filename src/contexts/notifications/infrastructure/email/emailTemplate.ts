// Plantilla HTML compartida para todos los correos transaccionales, con el
// mismo estilo visual del frontend (colores de marca, logo, tipografia).
// Usa tablas y estilos inline a proposito: es lo unico que renderiza de
// forma consistente en la mayoria de clientes de correo (Gmail, Outlook,
// Apple Mail), a diferencia de flexbox/grid o clases CSS externas.

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const BRAND_PRIMARY = "#2563EB";
const BRAND_SECONDARY = "#7DD3FC";
const BRAND_DARK = "#0F172A";
const NEUTRAL_500 = "#64748B";
const NEUTRAL_200 = "#E2E8F0";

interface EmailLayoutParams {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
}

export function renderEmailLayout(params: EmailLayoutParams): string {
  const { preheader, heading, bodyHtml, cta } = params;
  // Debe ser una URL absoluta y publicamente accesible: un cliente de correo
  // no puede resolver rutas relativas como "/assets/logo.png", necesita
  // poder descargarla desde internet. Por eso depende de FRONTEND_URL — si
  // sigue apuntando a localhost, el logo no va a cargar en el correo recibido
  // (localhost no es alcanzable desde fuera de esta maquina).
  const logoUrl = `${FRONTEND_URL}/assets/logo.png`;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>La Canchita de Carlos</title>
    <!--[if !mso]><!-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Lobster+Two:wght@700&display=swap');
    </style>
    <!--<![endif]-->
  </head>
  <body style="margin:0; padding:0; background-color:#F1F5F9; font-family:'Outfit', 'Segoe UI', Arial, sans-serif;">
    ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#FFFFFF; border-radius:24px; overflow:hidden; box-shadow:0 1px 3px rgba(15,23,42,0.08);">
            <tr>
              <td style="background-color:${BRAND_DARK}; padding:28px 32px; text-align:center;">
                <img src="${logoUrl}" alt="La Canchita de Carlos" width="56" height="56" style="border-radius:9999px; display:block; margin:0 auto 12px;" />
                <span style="font-family:'Lobster Two', Georgia, 'Times New Roman', serif; font-size:22px; font-weight:700; color:#FFFFFF; line-height:1.2;">
                  La Canchita <span style="color:${BRAND_SECONDARY};">de Carlos</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px; font-size:20px; font-weight:700; color:#0F172A;">${heading}</h1>
                <div style="font-size:15px; line-height:1.6; color:#334155;">
                  ${bodyHtml}
                </div>
                ${
                  cta
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
                  <tr>
                    <td style="border-radius:10px; background-color:${BRAND_PRIMARY};">
                      <a href="${cta.url}" target="_blank" style="display:inline-block; padding:13px 28px; font-size:15px; font-weight:600; color:#FFFFFF; text-decoration:none; border-radius:10px;">
                        ${cta.label}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0; font-size:12px; color:${NEUTRAL_500};">
                  Si el boton no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${cta.url}" style="color:${BRAND_PRIMARY}; word-break:break-all;">${cta.url}</a>
                </p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid ${NEUTRAL_200}; text-align:center;">
                <p style="margin:0; font-size:12px; color:${NEUTRAL_500};">
                  La Canchita de Carlos · 2026 © Oryon. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
