export interface CurrencyInfo {
    name: string;
    symbol: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
    USD: { name: "United States Dollar", symbol: "$" },
    EUR: { name: "Euro", symbol: "€" },
    GBP: { name: "British Pound", symbol: "£" },
    PKR: { name: "Pakistani Rupee", symbol: "₨" },
    INR: { name: "Indian Rupee", symbol: "₹" },
    JPY: { name: "Japanese Yen", symbol: "¥" },
    CAD: { name: "Canadian Dollar", symbol: "C$" },
    AUD: { name: "Australian Dollar", symbol: "A$" },
    CNY: { name: "Chinese Yuan", symbol: "¥" },
    RUB: { name: "Russian Ruble", symbol: "₽" },
    AED: { name: "UAE Dirham", symbol: "د.إ" },
    AFN: { name: "Afghan Afghani", symbol: "؋" },
    ALL: { name: "Albanian Lek", symbol: "L" },
    AMD: { name: "Armenian Dram", symbol: "֏" },
    ARS: { name: "Argentine Peso", symbol: "$" },
    BDT: { name: "Bangladeshi Taka", symbol: "৳" },
    BRL: { name: "Brazilian Real", symbol: "R$" },
    CHF: { name: "Swiss Franc", symbol: "Fr" },
    COP: { name: "Colombian Peso", symbol: "$" },
    CZK: { name: "Czech Koruna", symbol: "Kč" },
    DKK: { name: "Danish Krone", symbol: "kr" },
    EGP: { name: "Egyptian Pound", symbol: "E£" },
    HKD: { name: "Hong Kong Dollar", symbol: "HK$" },
    IDR: { name: "Indonesian Rupiah", symbol: "Rp" },
    ILS: { name: "Israeli New Shekel", symbol: "₪" },
    KRW: { name: "South Korean Won", symbol: "₩" },
    KWD: { name: "Kuwaiti Dinar", symbol: "KD" },
    LKR: { name: "Sri Lankan Rupee", symbol: "Rs" },
    MXN: { name: "Mexican Peso", symbol: "$" },
    MYR: { name: "Malaysian Ringgit", symbol: "RM" },
    NGN: { name: "Nigerian Naira", symbol: "₦" },
    NOK: { name: "Norwegian Krone", symbol: "kr" },
    NZD: { name: "New Zealand Dollar", symbol: "NZ$" },
    PHP: { name: "Philippine Peso", symbol: "₱" },
    PLN: { name: "Polish Złoty", symbol: "zł" },
    QAR: { name: "Qatari Riyal", symbol: "QR" },
    SAR: { name: "Saudi Riyal", symbol: "SR" },
    SEK: { name: "Swedish Krona", symbol: "kr" },
    SGD: { name: "Singapore Dollar", symbol: "S$" },
    THB: { name: "Thai Baht", symbol: "฿" },
    TRY: { name: "Turkish Lira", symbol: "₺" },
    TWD: { name: "New Taiwan Dollar", symbol: "NT$" },
    UAH: { name: "Ukrainian Hryvnia", symbol: "₴" },
    VND: { name: "Vietnamese Đồng", symbol: "₫" },
    ZAR: { name: "South African Rand", symbol: "R" }
};

export const getCurrencyOptions = () => {
    return Object.entries(CURRENCIES)
        .map(([code, info]) => ({
            value: code,
            label: `${info.name} (${code})`,
            symbol: info.symbol
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
};
