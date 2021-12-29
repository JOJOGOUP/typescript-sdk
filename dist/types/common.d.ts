export declare type GlobalInfo = {
    walletName: string;
    slippage: number;
};
export declare type Message = {
    duration?: number;
    doNotAutoRemove?: boolean;
    title: string;
    description: string;
    status: 'success' | 'error' | 'info' | 'loading';
    link?: string;
};
export declare type Transaction = {
    hash: string;
    status: 'success' | 'error' | 'loading';
    summary: string;
    addedTime: number;
    from: string;
};
export declare type FeeStructure = {
    tradeFeeNumerator: number;
    tradeFeeDenominator: number;
    ownerTradeFeeNumerator: number;
    ownerTradeFeeDenominator: number;
    ownerWithdrawFeeNumerator: number;
    ownerWithdrawFeeDenominator: number;
};
