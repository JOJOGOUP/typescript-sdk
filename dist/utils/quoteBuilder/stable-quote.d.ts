import { u64 } from '@solana/spl-token';
import { Quote, QuotePoolParams } from '../../types';
export declare class StablePoolQuoteBuilder {
    buildQuote(params: QuotePoolParams, inputTradeAmount: u64): Quote;
}
