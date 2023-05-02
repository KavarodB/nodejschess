class Room{

    constructor(name,locked,first_turn){
        this.name = name;
        this.locked = locked;
        this.first_turn = first_turn || Math.round(Math.random()+1);
    }
}
export default Room;