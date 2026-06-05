import Counter from './Modules/Counter.js';

async function main() {
	const CounterInstance = new Counter( 8, 'Hi-Lo' );
	CounterInstance.addCard( 2 );
	CounterInstance.addCard(12);
	CounterInstance.addCard(3);
	CounterInstance.addCard(2);
	CounterInstance.addCard(2);
	CounterInstance.addCard(2);
	// console.log( CounterInstance );
	console.log(CounterInstance.displayState());
	CounterInstance.removeLastCard();
	console.log(CounterInstance.displayState());
}

main();
