import { u64 } from '@solana/spl-token';
import { QuotePoolParams, Quote } from '../../types';
export declare class ConstantProductPoolQuoteBuilder {
    buildQuote(params: QuotePoolParams, inputTradeAmount: u64): Quote;
}
