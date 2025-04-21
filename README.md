# ColorSide
Colorful terminal control, amazing inputs and Random features!

> **Fun fact**<br>
> There are 666 lines in the code 😈

# Install
```bash
npm install colorside@latest
```
# Setup
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("en"); // language if instructions: 'ru' OR 'en'
cs.use(/* class */); // Using package classes
```
> [!NOTE] Если вы из России, по возможности купите мне поесть :)<br>
> Карта: 5599002097457313

# First call
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console) // Using class cs.console

cs.console.log("My first log!"); // like console.log
```

# Output (cs.console)
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);

cs.console.log("It's a basic log"); // Basic log like console.log
cs.console.warn("Warn??"); // Warn message with yellow text foreground
cs.console.error("Error!"); // Error message with red text foreground
cs.console.fatal("FATAL ERROR!!!") // Fatal error message with red text background and black foreground
```
Demo 1: <br>
<img src="https://cloud.fimastgd.tech/colorside/img1.jpg" width="200" alt="Demo 1">

## Text coloring
- cs.fg.color() - foreground color
- cs.fg.bright.color() - foreground bright color
- cs.bg.color() - background color
- cs.bg.bright.color() - background bright color
- cs.format.style() - bold / underlined text
<br>
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);

cs.console.log(cs.fg.bright.green(cs.format.bold("Green bright bold text")));
// likewise cs.format.underlined
```

Demo 2: <br> 
<img src="https://cloud.fimastgd.tech/colorside/img2.jpg" width="200" alt="Demo 2">

## Clear console
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);

cs.console.clear(); // clear screen
```

## Process freezing
The application does not close spontaneously
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);

cs.console.freeze();
cs.console.warn("Only Ctrl-C will kill app");

// Later, you can unfreeze the process automatically
// cs.console.unfreeze();
```

# Input (cs.input)
Input prompts using inquirer API
## Basic input
```ts
import ColorSide from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input); // Using class cs.input

async function main(): Promise<void> {
    const name = await cs.input.readline("Enter your name: "); // Basic input and nothing else
    cs.console.log(`Your name: ${cs.fg.bright.magenta(name)}`);
}

main();
```
Demo 3: <br>
<img src="https://cloud.fimastgd.tech/colorside/img3.gif" width="200" alt="Demo 3">

## Advanced input (text)
```ts
import ColorSide, { ANSI } from 'colorside';
// { ANSI } import required!

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readtext({
        message: /*(string)*/ "Enter your name:", // <- [No space after ':']
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        inputColor: /*(string)*/ ANSI.fg.bright.cyan, // input color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        default: /*(string)*/ "John", // default name
        validate: (val) => (val.toLowerCase() !== "adolf") || "Sorry, we don't support such names" // input validation
    });
    cs.console.log(`Your name: ${cs.fg.bright.magenta(name)}`);
}

main();
```

Demo 4: <br>
<img src="https://cloud.fimastgd.tech/colorside/img4.gif" width="200" alt="Demo 4">

## Advanced input (number)
```ts
import ColorSide, { ANSI } from 'colorside';
// { ANSI } import required!

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readnumber({
        message: /*(string)*/ "Enter your name:", // <- [No space after ':']
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        inputColor: /*(string)*/ ANSI.fg.bright.cyan, // input color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        default: /*(string)*/ "42", // default name
        validate: (val) => (Number(val > 100)) ? "Very big number!" : true // input validation
    });
    cs.console.log(`Your number: ${cs.fg.bright.magenta(name)}`);
}

main();
```


Demo 5: <br>
<img src="https://cloud.fimastgd.tech/colorside/img5.gif" width="200" alt="Demo 5">

## Advanced input (list)
```ts
import ColorSide, { ANSI } from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readlist({
        message: /*(string)*/ "Select OS:",
        choices: [
            { name: 'Windows', value: 'Windows' },
            { name: 'Linux (it\'s a base)', value: 'Linux'},
            { name: 'Mac', value: 'Mac', disabled: true}
        ],
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        // default: /*(string)*/ "value", - default name
        // validate: (val) => (condition) || else - input validation
        // instructions: (boolean) false - hide input instructions 
    });
    cs.console.log(`OS selected: ${cs.fg.bright.green(name)}`);
    
}

main();
```

Demo 6: <br>
<img src="https://cloud.fimastgd.tech/colorside/img6.gif" width="200" alt="Demo 6">

## Advanced input (checkbox)
```ts
import ColorSide, { ANSI } from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> { 
    const name = await cs.input.readcheckbox({
        message: /*(string)*/ "Select OS:",
        choices: [
            { name: 'Windows', value: 'Windows', description: 'Base user OS' },
            { name: 'Linux', value: 'Linux', description: 'Base server OS' },
            { name: 'Mac', value: 'Mac', description: 'Not OS' }
        ],
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        // default: /*(string)*/ "value", - default name
        // validate: (val) => (condition) || else - input validation
        // instructions: (boolean) false - hide input instructions 
    });
    cs.console.log(`OS selected: ${cs.fg.bright.green(name)}`);
}

main();
``` 

Demo 7: <br>
<img src="https://cloud.fimastgd.tech/colorside/img7.gif" width="200" alt="Demo 7">

## Advanced input (password)
```ts
import ColorSide, { ANSI } from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readpassword({
        message: /*(string)*/ "Enter your pass:",
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        inputColor: /*(string)*/ ANSI.fg.bright.cyan, // input color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        //default: /*(string)*/ - default name
        validate: (val) => (val === "ForeverHost") || "Incorrect password" // input validation
    });
    cs.console.log(`Your pass: ${cs.fg.bright.magenta(name)}`);
}

main();
``` 

Demo 8: <br>
<img src="https://cloud.fimastgd.tech/colorside/img8.gif" width="200" alt="Demo 8">

## Advanced input (confirm)
```ts
import ColorSide, { ANSI } from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readconfirm({
        message: /*(string)*/ "Install package?",
        
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        inputColor: /*(string)*/ ANSI.fg.bright.cyan, // input color
        // prefix: /*(null | string)*/ '>', - custom prefix. null = prefix disabled
        // finishPrefix: /*(boolean)*/ true, - show final prefix when input readed
        // default: /*(string)*/ - default name
        // validate: (val) => (condition) || else - input validation
    });
    cs.console.log(`Install package: ${cs.fg.bright.magenta(name)}`);
}

main();
``` 

Demo 9: <br>
<img src="https://cloud.fimastgd.tech/colorside/img9.jpg" width="200" alt="Demo 9">

## Advanced input (toggle)
```ts
import ColorSide, { ANSI } from 'colorside';

const cs: any = new ColorSide("ru");
cs.use(cs.console);
cs.use(cs.input);

async function main(): Promise<void> {
    const name = await cs.input.readtoggle({
        message: /*(string)*/ "Install package?",
        active: "Yes",
        inactive: "No",
        /* optional params */
        // messageColor: /*(string)*/ ANSI.fg.green, - message color
        // STRING ONLY prefix: /*(string)*/ '>', - custom prefix. null = prefix disabled
        // default: /*(string)*/ - default name
        // validate: (val) => (condition) || else - input validation
        
        /** @returns true / false */
    });
    cs.console.log(`Install package: ${cs.fg.bright.magenta(name)}`);
}

main();
``` 

Demo 10: <br>
<img src="https://cloud.fimastgd.tech/colorside/img10.jpg" width="200" alt="Demo 10">


# Random module 

```ts
import ColorSide, { Random, ANSI } from 'colorside

Random.Int(1, 7); // Random int in range
Random.Float(1, 7) // Random float in range
Random.String(['A-Z', 'a-z', '0-9', /* custom symbols */ '&_₽*$+=%'], 8 /* length */); // Random string value
``` 
