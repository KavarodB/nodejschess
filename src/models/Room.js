class Room {
	constructor(name, locked, first_turn, settings = null) {
		this.name = name;
		this.locked = locked;
		this.first_turn = first_turn || Math.round(Math.random() + 1);
		this.settings = settings;
	}
}
export default Room;
