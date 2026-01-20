import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const STRINGS = {
    EN: {
        LOGIN_TITLE: "Welcome to RealEstate Find",
        LOGIN_BTN: "Login with Google",
        MAP_TAB: "Map",
        SELL_TAB: "Sell Property",
        PRICE: "Price",
        OWNER: "Owner",
        VERIFIED: "Verified",
        BUY_REQ: "Request Buy",
        UPLOAD_DOCS: "Upload Documents",
        SUBMIT: "Submit"
    },
    HI: {
        LOGIN_TITLE: "रियल एस्टेट फाइंडर में आपका स्वागत है",
        LOGIN_BTN: "गूगल के साथ लॉगिन करें",
        MAP_TAB: "नक्शा",
        SELL_TAB: "संपत्ति बेचें",
        PRICE: "कीमत",
        OWNER: "मालिक",
        VERIFIED: "सत्यापित",
        BUY_REQ: "खरीदने का अनुरोध",
        UPLOAD_DOCS: "दस्तावेज़ अपलोड करें",
        SUBMIT: "जमा करें"
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('HI'); // Default Hindi as per user vibe

    const t = (key) => STRINGS[lang][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
