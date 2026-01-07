
import { Appointment, Service } from '../types';

export class MercadoPagoService {
  /**
   * Cria uma preferência de pagamento real usando a API do Mercado Pago.
   * Requer que o Access Token esteja configurado nas configurações clínicas.
   */
  static async createPreference(appointment: Appointment, service: Service, accessToken?: string): Promise<string> {
    if (!accessToken) {
      console.warn('Mercado Pago Access Token não configurado.');
      // Fallback para dev/teste ou erro
      // throw new Error("Token do Mercado Pago não configurado.");
      alert("ERRO: Token do Mercado Pago não configurado no painel Admin.");
      return '#';
    }

    try {
      const backUrl = window.location.origin; // Retorna para a aplicação atual

      const preferenceData = {
        items: [
          {
            id: service.id,
            title: service.name,
            description: service.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(service.price)
          }
        ],
        payer: {
          name: appointment.patientName,
          email: appointment.patientEmail,
          phone: {
            area_code: appointment.patientPhone.substring(0, 2),
            number: appointment.patientPhone.substring(2)
          }
        },
        back_urls: {
          success: `${backUrl}/?status=success`,
          failure: `${backUrl}/?status=failure`,
          pending: `${backUrl}/?status=pending`
        },
        auto_return: "approved",
        external_reference: appointment.id,
        statement_descriptor: "PSICANALISE"
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(preferenceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao criar preferência MP:', errorData);
        throw new Error('Falha na criação do pagamento: ' + (errorData.message || response.statusText));
      }

      const data = await response.json();

      // Retorna o init_point (link para checkout)
      // Em sandbox pode usar data.sandbox_init_point se preferir
      return data.init_point;

    } catch (error) {
      console.error('Erro no serviço Mercado Pago:', error);
      alert("Erro ao conectar com Mercado Pago. Verifique o console.");
      return '#';
    }
  }

  /**
   * Abre o checkout do Mercado Pago em uma nova janela ou modal
   */
  static openCheckout(initPoint: string) {
    if (!initPoint || initPoint === '#') return;

    const width = 1000;
    const height = 800;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    window.open(
      initPoint,
      'MercadoPagoCheckout',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  }
}
