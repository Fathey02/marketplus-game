import { MarketTick, TradeOrder } from '../interfaces';

export class MarketEngine {
  private currentPrice: number;
  private symbol: string;

  constructor(symbol: string = 'XAUUSD', initialPrice: number = 2350.0) {
    this.symbol = symbol;
    this.currentPrice = initialPrice;
  }

  public generateNextTick(): MarketTick {
    const volatility = 0.6;
    const delta = (Math.random() - 0.495) * volatility;
    this.currentPrice = parseFloat((this.currentPrice + delta).toFixed(2));

    return {
      symbol: this.symbol,
      price: this.currentPrice,
      timestamp: Date.now(),
    };
  }

  public getCurrentPrice(): number {
    return this.currentPrice;
  }

  public calculatePnL(order: TradeOrder, currentPrice: number): number {
    const multiplier = order.type === 'BUY' ? 1 : -1;
    const pointDifference = (currentPrice - order.price) * multiplier;
    return parseFloat((pointDifference * order.lotSize * 100).toFixed(2));
  }
}