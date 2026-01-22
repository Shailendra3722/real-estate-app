const MockTesseract = {
    recognize: async (image, lang, options) => {
        // Simulate scanning delay
        if (options && options.logger) {
            for (let i = 0; i <= 10; i++) {
                options.logger({ status: 'recognizing text', progress: i / 10 });
                await new Promise(r => setTimeout(r, 200));
            }
        }

        return {
            data: {
                text: "aadhaar card government of india male 1234 5678 9012",
                confidence: 95
            }
        };
    }
};

export default MockTesseract;
