import readline from 'readline';
import Config from './Assets/Config.json' with {type: 'json'};
import Counter from './Modules/Counter.js';
import { printTable } from "console-table-printer";
import { validateCard } from './Modules/Utility.js';

const Setting = {
	DeckSize: 8, 
	Strategy: "Wong Halves"
}

let CounterInstance = new Counter(Setting.DeckSize, Setting.Strategy);

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function displayStatistics(data) {
	console.log(`\nCounterJS\nShoe Size: ${Setting.DeckSize} Decks\nStrategy Used for Deviations: ${Setting.Strategy}`);
	if (data.ActiveDeviations.length > 0) {
		printTable(data.ActiveDeviations);
	}
	const cards = data['Cards'];
	const mappedCards = cards.map( c => {
		return {
			Hand: c.Card,
			Frequency: `${c.Frequency.CardsLeft} / ${c.Frequency.CardsTotal}`,
			ChanceOfCard: (c.ChanceOfCard * 100).toFixed(2),
			ChanceOfPair: (c.ChanceOfPair * 100).toFixed(3)
		};
	});
	printTable(mappedCards);
	printTable(data.Count);
}

function runCounter() {
	console.clear();
	displayStatistics(CounterInstance.displayState());
	rl.question(": ", (answer) => {
		if (answer == 'x') {
			rl.close();
			return;
		}
		if (answer == "u") {
			CounterInstance.removeLastCard();
			runCounter();
		}
		const userInput = parseInt(answer, 10);
		if (validateCard(userInput)) {
			const result = CounterInstance.addCard(userInput);
			if (!result.success) console.log(result.message);
		}
		runCounter();
	});
}

runCounter();