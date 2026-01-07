
import { Appointment, Service } from '../types';

export class MercadoPagoService {
  /**
   * Simula a criação de uma preferência de pagamento no backend.
   * Em produção, isso usaria o Access Token configurado no Admin.
   */
  static async createPreference(appointment: Appointment, service: Service, accessToken?: string): Promise<string> {
    console.log('Iniciando criação de preferência com token:', accessToken ? 'Configurado' : 'Padrão (Mock)');
    
    // Simulando latência de rede do servidor
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Link mockado do Checkout Pro (Sandbox)
    const mockInitPoint = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${Math.random().toString(36).substr(2, 9)}`;
    
    return mockInitPoint;
  }

  /**
   * Abre o checkout do Mercado Pago em uma nova janela ou modal
   */
  static openCheckout(initPoint: string) {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    
    window.open(
      initPoint, 
      'MercadoPagoCheckout', 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  }
}
