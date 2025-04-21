import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import util from 'util';
import inquirer, { Question, Answers } from 'inquirer';
import { password, input as text, select, checkbox, confirm } from '@inquirer/prompts';
import toggle from 'inquirer-toggle';

interface SelectColor<Type> {
	keys?: Type[], color?: string
}
type CustomQuestion = Partial<Question> & {
	messageColor?: string,
	inputColor?: string,
	prefix?: string | null,
	prefixColor?: string, // only with custom prefix 
	validate?: (input: string) => boolean | string,
	instructions?: boolean | string,
	finishPrefix?: boolean,
	selectColors?: SelectColor<string>[]
};
type ToggleTheme = {
	active?: string;
	inactive?: string;
	prefix?: {
		idle?: string;
		done?: string;
	};
	style?: {
		message?: (text: string) => string;
		answer?: (text: string) => string;
		highlight?: (text: string) => string;
	};
};
type ToggleQuestion = Partial<Question> & {
	messageColor?: string;
	inputColor?: string;
	prefix?: string | null;
	prefixColor?: string;
	validate?: (input: string) => boolean | string;
	instructions?: boolean | string;
	finishPrefix?: boolean;
	// Добавляем поддержку toggle-специфичных свойств
	active?: string;
	inactive?: string;
	theme?: ToggleTheme | {
		prefix?: {
			idle?: string;
			done?: string;
		};
		style?: {
			error?: (text: string) => string;
			answer?: (text: string) => string;
		};
	};
};
type Choice<Value> = {
	value: Value;
	name?: string;
	description?: string;
	short?: string;
	checked?: boolean;
	disabled?: boolean | string;
};
type bool = boolean;
// ANSI escape codes
export const ANSI = {
	reset: '\x1b[0m',
	fg: {
		black: '\x1b[30m',
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		reset: '\x1b[0m',
		bright: {
			black: '\x1b[90m',
			red: '\x1b[91m',
			green: '\x1b[92m',
			yellow: '\x1b[93m',
			blue: '\x1b[94m',
			magenta: '\x1b[95m',
			cyan: '\x1b[96m',
			white: '\x1b[97m',
		},
	},
	bg: {
		black: '\x1b[40m',
		red: '\x1b[41m',
		green: '\x1b[42m',
		yellow: '\x1b[43m',
		blue: '\x1b[44m',
		magenta: '\x1b[45m',
		cyan: '\x1b[46m',
		white: '\x1b[47m',
		bright: {
			black: '\x1b[100m',
			red: '\x1b[101m',
			green: '\x1b[102m',
			yellow: '\x1b[103m',
			blue: '\x1b[104m',
			magenta: '\x1b[105m',
			cyan: '\x1b[106m',
			white: '\x1b[107m',
		},
	},
	format: {
		bold: '\x1b[1m',
		underline: '\x1b[4m',
	},
} as const;

type ColorName = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

const createColorFunctions = (type: 'fg' | 'bg', isBright = false) => {
	const colors = isBright ? ANSI[type].bright : ANSI[type];
	return Object.entries(colors).reduce((acc, [name, code]) => ({
		...acc,
		[name]: (text: string) => `${code}${text}${ANSI.reset}`,
	}), {} as Record<ColorName, (text: string) => string>);
};

class ConsoleModule {
	private activated = false;
	private freezeInterval: NodeJS.Timeout | null = null;

	activate() { this.activated = true; }

	private checkActivation() {
		if (!this.activated) throw new Error('Console module not activated');
	}

	log(...args: any[]) {
		this.checkActivation();
		console.log(...args);
	}

	warn(...args: any[]) {
		this.checkActivation();
		console.warn(`${ANSI.fg.bright.yellow}${util.format(...args)}${ANSI.reset}`);
	}

	error(...args: any[]) {
		this.checkActivation();
		console.error(`${ANSI.fg.bright.red}${util.format(...args)}${ANSI.reset}`);
	}

	fatal(...args: any[]) {
		this.checkActivation();
		console.error(`${ANSI.bg.bright.red}${ANSI.fg.black}${util.format(...args)}${ANSI.reset}`);
	}

	clear() {
		this.checkActivation();
		console.clear();
	}

	freeze() {
		this.checkActivation();
		this.freezeInterval = setInterval(() => { }, 2147483647); // Максимальный интервал
	}

	unfreeze() {
		if (this.freezeInterval) {
			clearInterval(this.freezeInterval);
			this.freezeInterval = null;
		}
	}
}

class CollectionModule {
	private activated = false;

	activate() { this.activated = true; }

	private checkActivation() {
		if (!this.activated) throw new Error('Collection module not activated');
	}

	set(id: string, message: string) {
		this.checkActivation();
		process.stdout.write(message + '\n');
	}

	edit(id: string, newMessage: string) {
		this.checkActivation();
		process.stdout.write(newMessage + '\n');
	}
}

class InputModule {
	private lang: string;

	constructor(lang: string) {
		this.lang = lang;
	}

	private rl: readline.Interface | null = null;
	private activated = false;
	private stdin = process.stdin;
	private stdout = process.stdout;

	activate() {
		this.activated = true;
		return this;
	}

	private checkActivation() {
		if (!this.activated) throw new Error('Input module not activated');
	}

	styles(styles: { fg?: ColorName | `${ColorName}Bright`, bg?: ColorName | `${ColorName}Bright` }) {
		this.checkActivation();
		const codes: string[] = [];

		if (styles.fg) {
			const [name, type] = styles.fg.endsWith('Bright')
				? [styles.fg.slice(0, -6) as ColorName, 'bright']
				: [styles.fg as ColorName, 'normal'];
			codes.push(type === 'bright' ? ANSI.fg.bright[name] : ANSI.fg[name]);
		}

		if (styles.bg) {
			const [name, type] = styles.bg.endsWith('Bright')
				? [styles.bg.slice(0, -6) as ColorName, 'bright']
				: [styles.bg as ColorName, 'normal'];
			codes.push(type === 'bright' ? ANSI.bg.bright[name] : ANSI.bg[name]);
		}

		return codes.join('');
	}

	private applyPrefix<T extends Question>(prefix: string | null, question: T): T {
		return question;
	}

	async readline(prompt: string, style?: string) {
		this.checkActivation();
		this.rl = readline.createInterface({ input: this.stdin, output: this.stdout });
		const styledPrompt = style ? `${style}${prompt}${ANSI.reset}` : prompt + '';
		const answer = await this.rl.question(styledPrompt);
		this.rl.close();
		return answer;
	}

	async readtext(props: CustomQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		const finishPrefix: bool = props.finishPrefix ?? true;

		const options = {
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			validate: props.validate,
			default: props.default,
			theme: {
				prefix: {
					idle: (prefix === undefined) ? `${ANSI.fg.blue}?${ANSI.reset}` : (prefix === null) ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: finishPrefix ? `${ANSI.fg.bright.green}${ANSI.format.bold}✓${ANSI.reset}` : ""
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
					answer: (text) => inputColor ? `${inputColor}${text}${ANSI.reset}` : `${ANSI.fg.cyan}${text}${ANSI.reset}`
				}
			}
		};
		const result = await text(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
	async readnumber(props: CustomQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		const finishPrefix: bool = props.finishPrefix ?? true;
		const options = {
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			default: props.default,
			validate: (val: string) => {
				const num = Number(val);
				if (isNaN(num)) return (this.lang.toLowerCase() == "ru") ? "Разрешено вводить только число" : "Please provide a valid numeric value";
				// Проверяем, есть ли пользовательская валидация
				if (props.validate) {
					const customCheck = props.validate(val);
					if (customCheck !== true) return customCheck;
				}
				return true;
			},
			filter: (val: string) => {
				const num = Number(val);
				return isNaN(num) ? val : num;
			},
			theme: {
				prefix: {
					idle: (prefix === undefined) ? `${ANSI.fg.blue}?${ANSI.reset}` : (prefix === null) ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: finishPrefix ? `${ANSI.fg.bright.green}${ANSI.format.bold}✓${ANSI.reset}` : ""
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
					answer: (text) => inputColor ? `${inputColor}${text}${ANSI.reset}` : `${ANSI.fg.cyan}${text}${ANSI.reset}`
				}
			}
		};
		const result = await text(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
	async readconfirm(props: CustomQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		const finishPrefix: bool = props.finishPrefix ?? true;
		const options = {
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			validate: props.validate,
			default: props.default,
			theme: {
				prefix: {
					idle: (prefix === undefined) ? `${ANSI.fg.blue}?${ANSI.reset}` : (prefix === null) ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: finishPrefix ? `${ANSI.fg.bright.green}${ANSI.format.bold}✓${ANSI.reset}` : ""
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
				}
			}
		};

		const result = await confirm(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
	async readlist(props: CustomQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		let instructions: bool | string | undefined;
		const finishPrefix: bool = props.finishPrefix ?? true;
		const selectColors: SelectColor<string>[] = props.selectColors || [];
		if (props.instructions == undefined || props.instructions == true) {
			if (this.lang.toLowerCase() == "ru") {
				instructions = `(Стрелки вверх/вниз для навигации)`;
			} else {
				instructions = `(Use arrow keys to navigate)`;
			}
		} else {
			instructions = false;
		}
		const options = {
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			validate: props.validate,
			choices: props.choices,
			default: props.default,
			instructions: instructions,
			theme: {
				prefix: {
					idle: (prefix === undefined) ? `${ANSI.fg.blue}?${ANSI.reset}` : (prefix === null) ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: finishPrefix ? `${ANSI.fg.bright.green}${ANSI.format.bold}✓${ANSI.reset}` : ""
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
					help: (text: string) => instructions || "",
					disabled: (text: string) => (this.lang.toLowerCase() == "ru") ? text.replace(/disabled/g, 'отключено') : text,
					highlight: (text: string) => {
						const cleanText = text.replace("> ", "");
						for (const colorItem of selectColors) {
							if (colorItem.keys.includes(cleanText)) {
								return `${colorItem.color}${text}${ANSI.reset}`;
							}
						}
						return `${ANSI.fg.cyan}${text}${ANSI.reset}`;
					}
				}
			}
		};

		const result = await select(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}


	async readcheckbox<Value = unknown>(props: {
		message: string;
		messageColor?: string;
		inputColor?: string;
		prefix?: string | null;
		prefixColor?: string;
		choices: Choice<Value>[];
		default?: Value[];
		validate?: (values: Value[]) => string | boolean;
		instructions?: boolean | string;
		hardcheck?: boolean;
		finishPrefix?: boolean;
		selectColors?: SelectColor<string>[];
	}) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});

		const messageColor = props.messageColor ?? "";
		const inputColor = props.inputColor ?? "";
		const prefix = props.prefix === undefined ? undefined :
			props.prefix === null ? null : props.prefix;
		const prefixColor = props.prefixColor ?? "";
		let instructions: bool | string | undefined;
		const finishPrefix: bool = props.finishPrefix ?? true;
		const selectColors: SelectColor<string>[] = props.selectColors || [];

		if (props.instructions == undefined || props.instructions == true) {
			if (this.lang.toLowerCase() == "ru") {
				instructions = ` (Используйте ${ANSI.fg.bright.cyan}стрелки вверх/вниз${ANSI.reset} для перемещения, ${ANSI.fg.bright.cyan}пробел${ANSI.reset} для выбора элемента, нажмите ${ANSI.fg.bright.cyan}'a'${ANSI.reset} чтобы выделить всё, ${ANSI.fg.bright.cyan}ENTER${ANSI.reset} для продолжения)`;
			} else {
				instructions = true;
			}
		} else {
			instructions = false;
		}
		const options = {
			message: `${messageColor}${props.message}${ANSI.reset}${inputColor}`,
			choices: props.choices,
			default: props.default,
			instructions: instructions,
			validate: (selectedItems: readonly Choice<Value>[]) => {
				const values = selectedItems.map(item => item.value);
				if (props.hardcheck) {
					if (values.length === 0) {
						return (this.lang.toLowerCase() == "ru") ? 'Выберите хотя бы один вариант' : 'Select at least one option';
					}
				}
				if (props.validate) {
					const validationResult = props.validate(values);
					if (typeof validationResult === 'string') {
						return validationResult;
					}
					if (validationResult === false) { }
				}
				return true;
			},
			theme: {
				prefix: {
					idle: prefix === undefined ? `${ANSI.fg.blue}?${ANSI.reset}` :
						prefix === null ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: finishPrefix ? `${ANSI.fg.bright.green}${ANSI.format.bold}✓${ANSI.reset}` : ""
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}✗${ANSI.reset} ${ANSI.fg.bright.red}${text}`,
					disabledChoice: (text: string) => (this.lang.toLowerCase() == "ru") ? `${text.replace(/\(disabled\)/g, "(отключено)")}` : `${text}`,
					highlight: (text: string) => {
						const cleanText = text.replace(">( ) ", "");
						for (const colorItem of selectColors) {
							if (colorItem.keys.includes(cleanText)) {
								return `${colorItem.color}${text}${ANSI.reset}`;
							}
						}
						return `${ANSI.fg.cyan}${text}${ANSI.reset}`;
					}
				}
			}
		};
		const result = await checkbox<Value>(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
	async readpassword(props: CustomQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		const finishPrefix: bool = props.finishPrefix ?? true;
		const options = {
			mask: true,
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			validate: props.validate,
			default: props.default,
			theme: {
				prefix: {
					idle: (prefix === undefined) ? `${ANSI.fg.blue}?${ANSI.reset}` : (prefix === null) ? '' : `${prefixColor}${prefix}${ANSI.reset}`,
					done: `${ANSI.fg.bright.green}${ANSI.format.bold}\u2713${ANSI.reset}`
				},
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
					answer: (text) => inputColor ? `${inputColor}${text}${ANSI.reset}` : `${ANSI.fg.cyan}${text}${ANSI.reset}`
				}
			}
		};
		const result = await password(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
	async readtoggle(props: ToggleQuestion) {
		this.checkActivation();
		const cs = new ColorSide("en");
		cs.use(cs.console);
		cs.console.freeze();
		process.on('SIGINT', () => {
			process.stdout.write(ANSI.reset + "\n");
			process.exit(0);
		});
		const message: string = String(props.message);
		const messageColor: string = props.messageColor ?? "";
		const inputColor: string = props.inputColor ?? "";
		const prefix: string | null | undefined = (props.prefix === undefined) ? undefined : (props.prefix === null) ? null : props.prefix;
		const prefixColor: string = props.prefixColor ?? "";
		const finishPrefix: bool = props.finishPrefix ?? true;
		const options = {
			message: `${messageColor}${message}${ANSI.reset}${inputColor}`,
			validate: props.validate,
			default: props.default,
			theme: {
				active: props.active ?? "Yes",
				inactive: props.inactive ?? "No",
				prefix: prefix ? `${prefixColor}${prefix}` : `${ANSI.fg.blue}?${ANSI.reset}`,
				style: {
					error: (text: string) => `${ANSI.fg.bright.red}${ANSI.format.bold}\u2717${ANSI.reset}${ANSI.fg.bright.red} ${text}${ANSI.reset}`,
					answer: (text) => inputColor ? `${inputColor}${text}${ANSI.reset}` : `${ANSI.fg.cyan}${text}${ANSI.reset}`
				}
			}
		};
		const result = await toggle(options);
		process.stdout.write(ANSI.reset);
		cs.console.unfreeze();
		return result;
	}
}

export default class ColorSide {
	private lang: string;
	public readonly console = new ConsoleModule();
	public readonly collection = new CollectionModule();
	public readonly input: InputModule;
	constructor(lang) {
		this.lang = lang;
		this.input = new InputModule(this.lang);
	}
	public readonly fg = {
		...createColorFunctions('fg'),
		bright: createColorFunctions('fg', true),
	};
	public readonly bg = {
		...createColorFunctions('bg'),
		bright: createColorFunctions('bg', true),
	};
	public readonly format = {
		bold: (text: string) => `${ANSI.format.bold}${text}${ANSI.reset}`,
		underline: (text: string) => `${ANSI.format.underline}${text}${ANSI.reset}`,
	};
	use(module: ConsoleModule | CollectionModule | InputModule) {
		if (module === this.console) this.console.activate();
		else if (module === this.collection) this.collection.activate();
		else if (module === this.input) this.input.activate();
	}
}

export class Random {
	/** Generates a random int
	 * @param min - minimum value in range
	 * @param max - maximum value in range
	 * @returns number - random int in range
	*/
	public static Int(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	/** Generates a random float
	 * @param min - minimum value in range
	 * @param max - maximum value in range
	 * @returns number - random float in range
	*/
	public static Float(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}
	/** Generates a random string
	 * @param charSets - symbol ranges (a-z, A-Z, 0-9, CuSt0M_Symbols)
	 * @param length - string length
	 * @returns string - random string
	*/
	public static String(charSets: string[], length: number): string {
		let charPool = '';
		for (const set of charSets) {
			if (set === 'a-z') {
				for (let i = 97; i <= 122; i++) {
					charPool += String.fromCharCode(i);
				}
			} else if (set === 'A-Z') {
				for (let i = 65; i <= 90; i++) {
					charPool += String.fromCharCode(i);
				}
			} else if (set === '0-9') {
				for (let i = 48; i <= 57; i++) {
					charPool += String.fromCharCode(i);
				}
			} else {
				charPool += set;
			}
		}
		let result = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charPool.length);
			result += charPool[randomIndex];
		}
		return result;
	}
		}
