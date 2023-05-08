class Settings {
	constructor(hasCoords = true, hasPieces = true, historyReduce = false) {
		this.hasCoords = hasCoords;
		this.hasPieces = hasPieces;
		this.historyReduce = historyReduce;
	}

	static compare(settings1, settings2) {
		if (settings1.hasCoords != settings2.hasCoords) return false;
		if (settings1.hasPieces != settings2.hasPieces) return false;
		if (settings1.historyReduce != settings2.historyReduce) return false;
		return true;
	}
}
export default Settings;
