interface ANSI256Patcher {
    get: {
        /**
         * Получает ANSI escape-код для установки цвета текста
         * @param hex HEX-код цвета (с # или без)
         * @returns ANSI escape-последовательность
         */
        fg: (hex: string) => string;
        
        /**
         * Получает ANSI escape-код для установки цвета фона
         * @param hex HEX-код цвета (с # или без)
         * @returns ANSI escape-последовательность
         */
        bg: (hex: string) => string;
    };
    
    replace: {
        /**
         * Заменяет цвет текста и возвращает строку с ANSI escape-последовательностями
         * @param hex HEX-код цвета (с # или без)
         * @param text Текст для окрашивания
         * @returns Строка с применёнными ANSI escape-последовательностями
         */
        fg: (hex: string, text: string) => string;
        
        /**
         * Заменяет цвет фона и возвращает строку с ANSI escape-последовательностями
         * @param hex HEX-код цвета (с # или без)
         * @param text Текст с изменённым фоном
         * @returns Строка с применёнными ANSI escape-последовательностями
         */
        bg: (hex: string, text: string) => string;
    };
}

export const ANSI256: ANSI256Patcher = {
	get: {
		fg: (hex: string) => {
			const isBackground = false;
			hex = hex.replace(/^#/, '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);

			// Явно проверяем, является ли цвет серым (включая белый/чёрный)
			const isGray = Math.max(r, g, b) - Math.min(r, g, b) <= 10; // Изменили на <=

			if (isGray) {
				const gray = Math.round((r + g + b) / 3);
				// Учитываем крайние случаи (0 и 255)
				var ansiCode = gray <= 8 ? 16 : gray >= 248 ? 231 : 232 + Math.round((gray - 8) / 10);
			} else {
				// RGB-куб
				const ri = Math.min(5, Math.max(0, Math.round((r - 55) / 40)));
				const gi = Math.min(5, Math.max(0, Math.round((g - 55) / 40)));
				const bi = Math.min(5, Math.max(0, Math.round((b - 55) / 40)));
				var ansiCode = 16 + (ri * 36) + (gi * 6) + bi;
			}

			return `\x1b[${isBackground ? 48 : 38};5;${ansiCode}m`;
		},
		bg: (hex: string) => {
			const isBackground = true;
			hex = hex.replace(/^#/, '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);

			// Явно проверяем, является ли цвет серым (включая белый/чёрный)
			const isGray = Math.max(r, g, b) - Math.min(r, g, b) <= 10; // Изменили на <=

			if (isGray) {
				const gray = Math.round((r + g + b) / 3);
				// Учитываем крайние случаи (0 и 255)
				var ansiCode = gray <= 8 ? 16 : gray >= 248 ? 231 : 232 + Math.round((gray - 8) / 10);
			} else {
				// RGB-куб
				const ri = Math.min(5, Math.max(0, Math.round((r - 55) / 40)));
				const gi = Math.min(5, Math.max(0, Math.round((g - 55) / 40)));
				const bi = Math.min(5, Math.max(0, Math.round((b - 55) / 40)));
				var ansiCode = 16 + (ri * 36) + (gi * 6) + bi;
			}

			return `\x1b[${isBackground ? 48 : 38};5;${ansiCode}m`;
		}
	},
	replace: {
		fg: (hex, text: string) => {
			const isBackground = false;
			hex = hex.replace(/^#/, '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);

			// Явно проверяем, является ли цвет серым (включая белый/чёрный)
			const isGray = Math.max(r, g, b) - Math.min(r, g, b) <= 10; // Изменили на <=

			if (isGray) {
				const gray = Math.round((r + g + b) / 3);
				// Учитываем крайние случаи (0 и 255)
				var ansiCode = gray <= 8 ? 16 : gray >= 248 ? 231 : 232 + Math.round((gray - 8) / 10);
			} else {
				// RGB-куб
				const ri = Math.min(5, Math.max(0, Math.round((r - 55) / 40)));
				const gi = Math.min(5, Math.max(0, Math.round((g - 55) / 40)));
				const bi = Math.min(5, Math.max(0, Math.round((b - 55) / 40)));
				var ansiCode = 16 + (ri * 36) + (gi * 6) + bi;
			}
			
			return `\x1b[${isBackground ? 48 : 38};5;${ansiCode}m${<string>text}\x1b[0m`;
		},
		bg: (hex: string, text: string) => {
			const isBackground = true;
			hex = hex.replace(/^#/, '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);

			// Явно проверяем, является ли цвет серым (включая белый/чёрный)
			const isGray = Math.max(r, g, b) - Math.min(r, g, b) <= 10; // Изменили на <=

			if (isGray) {
				const gray = Math.round((r + g + b) / 3);
				// Учитываем крайние случаи (0 и 255)
				var ansiCode = gray <= 8 ? 16 : gray >= 248 ? 231 : 232 + Math.round((gray - 8) / 10);
			} else {
				// RGB-куб
				const ri = Math.min(5, Math.max(0, Math.round((r - 55) / 40)));
				const gi = Math.min(5, Math.max(0, Math.round((g - 55) / 40)));
				const bi = Math.min(5, Math.max(0, Math.round((b - 55) / 40)));
				var ansiCode = 16 + (ri * 36) + (gi * 6) + bi;
			}

			return `\x1b[${isBackground ? 48 : 38};5;${ansiCode}m${<string>text}\x1b[0m`;
		}
	} 
};


// Examples
// console.log(ANSI256.replace.bg("#dc0000", "          "));
// console.log(ANSI256.replace.bg("#ff0202", "          "));
// console.log(ANSI256.replace.bg("#f36800", "          "));
