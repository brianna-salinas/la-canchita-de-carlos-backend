import "dotenv/config";
import { Resend } from "resend";
import type { NotificationSender } from "../../application/ports/NotificationSender.js";
import { renderEmailLayout } from "./emailTemplate.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "La Canchita de Carlos <no-reply@example.com>";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Adaptador de salida: implementa el puerto NotificationSender contra Resend.
export class ResendNotificationSender implements NotificationSender {
  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!resend) {
      console.warn(`[email] RESEND_API_KEY no configurado — se omite el envio a ${to}: ${subject}`);
      return;
    }
    try {
      await resend.emails.send({ from: RESEND_FROM_EMAIL, to, subject, html });
    } catch (err) {
      // RF24: un fallo de envio nunca debe revertir ni bloquear la operacion que lo disparo.
      console.error(`[email] fallo al enviar a ${to}:`, err);
    }
  }

  // RF23/RF24 — confirmacion de alquiler registrado.
  sendBookingConfirmation(params: {
    to: string;
    customerName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void> {
    const { to, customerName, courtName, date, startTime, endTime } = params;
    const html = renderEmailLayout({
      preheader: `Tu alquiler de ${courtName} el ${date} quedo confirmado.`,
      heading: "¡Tu alquiler esta confirmado!",
      bodyHtml: `
        <p>Hola ${customerName},</p>
        <p>Confirmamos tu alquiler con los siguientes detalles:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; background-color:#F8FAFC; border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;"><strong>Cancha:</strong> ${courtName}</p>
              <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin:0;"><strong>Horario:</strong> ${startTime} — ${endTime}</p>
            </td>
          </tr>
        </table>
        <p>Gracias por elegirnos. ¡Te esperamos!</p>`,
    });
    return this.send(to, "Confirmacion de tu alquiler — La Canchita de Carlos", html);
  }

  // RF22 — resultado de una solicitud de acceso (autorizada o rechazada).
  sendAdminDecision(params: { to: string; name: string; approved: boolean }): Promise<void> {
    const { to, name, approved } = params;
    const subject = approved ? "Tu solicitud de acceso fue autorizada" : "Tu solicitud de acceso fue rechazada";
    const html = renderEmailLayout({
      preheader: subject,
      heading: approved ? "¡Tu acceso fue autorizado!" : "Tu solicitud fue rechazada",
      bodyHtml: approved
        ? `<p>Hola ${name},</p>
           <p>Tu solicitud de acceso a La Canchita de Carlos fue <strong>autorizada</strong>. Revisa tu correo en unos momentos para verificar tu cuenta y activarla.</p>`
        : `<p>Hola ${name},</p>
           <p>Tu solicitud de acceso a La Canchita de Carlos fue <strong>rechazada</strong>. Si crees que esto es un error, comunicate con el administrador.</p>`,
    });
    return this.send(to, subject, html);
  }

  // RF34 — verificacion de correo antes de activar la cuenta.
  sendEmailVerification(params: { to: string; name: string; rawToken: string }): Promise<void> {
    const { to, name, rawToken } = params;
    const link = `${FRONTEND_URL}/verificar-correo?token=${rawToken}`;
    const html = renderEmailLayout({
      preheader: "Confirma tu correo para activar tu cuenta.",
      heading: "Verifica tu correo",
      bodyHtml: `
        <p>Hola ${name},</p>
        <p>Tu cuenta fue autorizada. Antes de poder iniciar sesion, confirma que este es tu correo
        presionando el boton de abajo (valido por 24 horas).</p>`,
      cta: { label: "Verificar correo", url: link },
    });
    return this.send(to, "Verifica tu correo — La Canchita de Carlos", html);
  }

  // "¿Olvidaste tu contraseña?" — enlace de un solo uso para restablecerla.
  sendPasswordReset(params: { to: string; name: string; rawToken: string }): Promise<void> {
    const { to, name, rawToken } = params;
    const link = `${FRONTEND_URL}/restablecer-password?token=${rawToken}`;
    const html = renderEmailLayout({
      preheader: "Restablece tu contraseña.",
      heading: "Restablece tu contraseña",
      bodyHtml: `
        <p>Hola ${name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Presiona el botón de abajo para
        elegir una nueva (válido por 1 hora). Si tú no pediste esto, puedes ignorar este correo.</p>`,
      cta: { label: "Restablecer contraseña", url: link },
    });
    return this.send(to, "Restablece tu contraseña — La Canchita de Carlos", html);
  }

  // RF21 — avisa a un owner que hay una solicitud de acceso nueva para revisar.
  sendNewAccessRequestAlert(params: { to: string; requesterName: string; requesterEmail: string }): Promise<void> {
    const { to, requesterName, requesterEmail } = params;
    const html = renderEmailLayout({
      preheader: `${requesterName} solicito una cuenta de administrador.`,
      heading: "Nueva solicitud de acceso",
      bodyHtml: `
        <p>Hola,</p>
        <p><strong>${requesterName}</strong> (${requesterEmail}) solicito una cuenta de administrador.</p>
        <p>Entra al sistema para revisarla y autorizarla o rechazarla.</p>`,
      cta: { label: "Revisar solicitud", url: `${FRONTEND_URL}/ajustes/solicitudes` },
    });
    return this.send(to, "Nueva solicitud de acceso — La Canchita de Carlos", html);
  }

  // Aviso entre administradores de una reserva nueva registrada por otro admin.
  sendNewBookingAlert(params: {
    to: string;
    registeredByName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void> {
    const { to, registeredByName, courtName, date, startTime, endTime } = params;
    const html = renderEmailLayout({
      preheader: `${registeredByName} registro una reserva de ${courtName}.`,
      heading: "Nueva reserva registrada",
      bodyHtml: `
        <p>Hola,</p>
        <p><strong>${registeredByName}</strong> registro un alquiler con los siguientes detalles:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; background-color:#F8FAFC; border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;"><strong>Cancha:</strong> ${courtName}</p>
              <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin:0;"><strong>Horario:</strong> ${startTime} — ${endTime}</p>
            </td>
          </tr>
        </table>`,
      cta: { label: "Ver reservas", url: `${FRONTEND_URL}/reservas` },
    });
    return this.send(to, "Nueva reserva registrada — La Canchita de Carlos", html);
  }
}

// Instancia unica del adaptador (composicion simple, sin contenedor de DI — coherente
// con la eleccion de Express sobre NestJS en 4.7).
export const notificationSender: NotificationSender = new ResendNotificationSender();
