import { u64 } from '@solana/spl-token';
import { QuotePoolParams, Quote } from '../../types';
import { CurveType } from '../';
export interface QuoteBuilder {
    buildQuote(pool: QuotePoolParams, inputAmount: u64): Quote;
}
export declare class QuoteBuilderFactory {
    static getBuilder(curveType: CurveType): QuoteBuilder | undefined;
}
