import "dotenv/config";
import { Resend } from "resend";
import type { NotificationSender } from "../application/ports/NotificationSender.js";

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
    return this.send(
      to,
      "Confirmacion de tu alquiler — La Canchita de Carlos",
      `<p>Hola ${customerName},</p>
       <p>Confirmamos tu alquiler de <strong>${courtName}</strong> el <strong>${date}</strong>
       de <strong>${startTime}</strong> a <strong>${endTime}</strong>.</p>
       <p>Gracias por elegirnos.</p>`
    );
  }

  // RF22 — resultado de una solicitud de acceso (autorizada o rechazada).
  sendAdminDecision(params: { to: string; name: string; approved: boolean }): Promise<void> {
    const { to, name, approved } = params;
    const subject = approved ? "Tu solicitud de acceso fue autorizada" : "Tu solicitud de acceso fue rechazada";
    const body = approved
      ? `<p>Hola ${name}, tu solicitud de acceso a La Canchita de Carlos fue autorizada. Revisa tu correo para verificarlo y activar tu cuenta.</p>`
      : `<p>Hola ${name}, tu solicitud de acceso a La Canchita de Carlos fue rechazada.</p>`;
    return this.send(to, subject, body);
  }

  // RF34 — verificacion de correo antes de activar la cuenta.
  sendEmailVerification(params: { to: string; name: string; rawToken: string }): Promise<void> {
    const { to, name, rawToken } = params;
    const link = `${FRONTEND_URL}/verificar-correo?token=${rawToken}`;
    return this.send(
      to,
      "Verifica tu correo — La Canchita de Carlos",
      `<p>Hola ${name}, tu cuenta fue autorizada. Antes de poder iniciar sesion, confirma que este es
       tu correo haciendo clic en el siguiente enlace (valido por 24 horas):</p>
       <p><a href="${link}">${link}</a></p>`
    );
  }
}

// Instancia unica del adaptador (composicion simple, sin contenedor de DI — coherente
// con la eleccion de Express sobre NestJS en 4.7).
export const notificationSender: NotificationSender = new ResendNotificationSender();
