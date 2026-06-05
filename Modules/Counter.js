import Cards from '../Assets/Cards.json' with { type: 'json' };
import Config from '../Assets/Config.json' with { type: 'json' };

export default class Counter {
	constructor( NumberOfDecks = 8, Strategy = 'Hi-Lo' ) {
		this.NumberOfDecks = NumberOfDecks;
		if ( !Config.Strategies.includes( Strategy ) ) {
			throw new Error( `Invalid strategy: ${ Strategy }. Valid strategies are: ${ Config.Strategies.join( ', ' ) }` );
		}
		this.Strategy = Strategy;
		this.RunningCount = {
			'Hi-Lo': 0,
			'Wong Halves': 0
		};
		this.History = [];
		this.CardsTally = Cards;
	}

	/**
	 * Gets the number of cards left for a specific card value.
	 * @param {number} card - The card value (1-13).
	 * @returns {Object} An object indicating success or failure, the card details, and the number of cards left.
	 */
	getIndividualCardLeft( card ) {
		if ( !this.CardsTally[ card ] ) {
			return {success: false, message: `Invalid card: ${ card }.` };
		}
		const TotalCards = this.NumberOfDecks * 4;
		const CardsLeft = TotalCards - this.CardsTally[ card ].Frequency;
		return {success: true, Card: this.CardsTally[ card ], CardsLeft: CardsLeft };
	}

	/**
	 * Calculates the chance of getting a specific card value.
	 * @param {number} card - The card value (1-13).
	 * @returns {Object} An object indicating success or failure and the chance of getting the card.
	 */
	getChanceOfGettingCard( card ) {
		if ( !this.CardsTally[ card ] ) {
			return {success: false, message: `Invalid card: ${ card }.` };
		}
		const TotalCards = this.NumberOfDecks * 4;
		const CardsLeft = this.getIndividualCardLeft( card ).CardsLeft;
		const Chance = CardsLeft / ( this.NumberOfDecks * 52 - this.History.length );
		return {success: true, Chance: Chance };
	}

	/**
	 * Calculates the chance of getting a pair of a specific card value.
	 * @param {number} card - The card value (1-13).
	 * @returns {Object} An object indicating success or failure and the chance of getting a pair.
	 */
	getChanceOfGettingPair( card ) {
		if ( !this.CardsTally[ card ] ) {
			return {success: false, message: `Invalid card: ${ card }.` };
		}
		const TotalCards = this.NumberOfDecks * 4;
		const CardsLeft = this.getIndividualCardLeft( card ).CardsLeft;
		const Chance = CardsLeft / ( this.NumberOfDecks * 52 - this.History.length );
		const ChanceOfPair = Chance * ( CardsLeft - 1 ) / ( this.NumberOfDecks * 52 - this.History.length - 1 );
		return {success: true, ChanceOfPair: ChanceOfPair };
	}

	/**
	 * Gets the last five cards added to the counter and their corresponding tally values.
	 * @returns {Array} An array of the last five cards and their tally values.
	 */
	getLastFiveCards() {
		const lastFiveCards = this.History.slice( -5 );
		let lastFiveCardsTally = [];
		return lastFiveCards.map( card => {
			lastFiveCardsTally.push( this.CardsTally[ card ] );
			return this.CardsTally[ card ];
		});
	}

	/**
	 * Gets the true count based on the running count and decks remaining.
	 * @returns {Object} The true count for each strategy.
	 */
	getTrueCount() {
		const DecksRemaining = ( this.NumberOfDecks * 52 - this.History.length ) / 52;
		return {
			'Hi-Lo': this.RunningCount[ 'Hi-Lo' ] / DecksRemaining,
			'Wong Halves': this.RunningCount[ 'Wong Halves' ] / DecksRemaining
		};
	}

	/**
	 * Adds a card to the counter and updates the running count and card tally.
	 * @param {number} card - The card to be added (1-13).
	 * @returns {Object} An object indicating success or failure and a message.
	 */
	addCard( card ) {
		if ( !this.CardsTally[ card ] ) {
			return {success: false, message: `Invalid card: ${ card }.` };
		}
		this.History.push( card );
		this.RunningCount[ 'Hi-Lo' ] += this.CardsTally[ card ]['Strategy'][ 'Hi-Lo' ];
		this.RunningCount[ 'Wong Halves' ] += this.CardsTally[ card ]['Strategy'][ 'Wong Halves' ];
		this.CardsTally[ card ].Frequency += 1;
		return {success: true, message: `Card ${ card } added successfully.` };
	}

	/**
	 * Removes the last card added to the counter and updates the running count and card tally.
	 * @returns {Object} An object indicating success or failure and a message.
	 */
	removeLastCard() {
		if ( this.History.length === 0 ) {
			return {success: false, message: 'No cards to remove.' };
		}
		const lastCard = this.History.pop();
		this.RunningCount[ 'Hi-Lo' ] -= this.CardsTally[ lastCard ]['Strategy'][ 'Hi-Lo' ];
		this.RunningCount[ 'Wong Halves' ] -= this.CardsTally[ lastCard ]['Strategy'][ 'Wong Halves' ];
		this.CardsTally[ lastCard ].Frequency -= 1;
		return {success: true, message: `Last card ${ lastCard } removed successfully.` };
	}

	/**
	 * Gets the active deviations based on the current true count.
	 * @returns {Object} An object containing the active deviations and their actions.
	 */
	getActiveDeviations() {
		let activeDeviations = {};
		const trueCount = this.getTrueCount()[ this.Strategy ];
		for ( let i = 0; i < Config.Deviations.length; i++ ) {
			const deviation = Config.Deviations[ i ];
			if (
				deviation.ThresholdConditionOver &&
				trueCount >= deviation.TrueCount
			) {
				activeDeviations[deviation.Hand] = deviation.Action;
			}
			if (
				!deviation.ThresholdConditionOver &&
				trueCount <= deviation.TrueCount
			) {
				activeDeviations[deviation.Hand] = deviation.Action;
			}
		}
		return activeDeviations;
	}

	getChanceOfBust( PlayerTotal ) {
		// Check if PlayerTotal is an integer
		if ( !Number.isInteger( PlayerTotal ) ) {
			return {success: false, message: `Invalid player total: ${ PlayerTotal }. Player total must be an integer.` };
		}
		// Validate player total
		if ( PlayerTotal < 10 || PlayerTotal > 21 ) {
			return {success: false, message: `Invalid player total: ${ PlayerTotal }. Player total must be between 10 and 21.` };
		}

		let chanceOfBust = 0;
		for (let i = PlayerTotal; i <= 21 && (21 - i) > 0; i++) {
			chanceOfBust += this.getChanceOfGettingCard( 21 - i ).Chance;
		}
		return {success: true, ChanceOfBust: chanceOfBust };
	}

	/**
	 * Displays the current state of the counter.
	 * @returns {Object} The current state of the counter.
	 */
	displayState() {
		let returnState = {};

		returnState['Cards'] = {};

		// Loop through the CardsTally and add the card details to the returnState
		for ( let card in this.CardsTally ) {
			returnState['Cards'][ this.CardsTally[card]['Symbol'] ] = {
				'Frequency': {
					'CardsLeft': this.getIndividualCardLeft( card ).CardsLeft,
					'CardsTotal': this.NumberOfDecks * 4
				},
				'ChanceOfPair': this.getChanceOfGettingPair( card ).ChanceOfPair,
				'ChanceOfCard': this.getChanceOfGettingCard( card ).Chance
			};
		}

		returnState['ActiveDeviations'] = this.getActiveDeviations();

		// Add the running count and true count for each strategy to the returnState
		returnState['Count'] = {};
		for ( let strategy in this.RunningCount ) {
			returnState['Count'][ strategy ] = {
				'RunningCount': this.RunningCount[ strategy ],
				'TrueCount': this.getTrueCount()[ strategy ]
			};
		}

		return returnState;
	}

}