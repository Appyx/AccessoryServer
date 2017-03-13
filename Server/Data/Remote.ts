/**
 * Created by Robert on 12/01/2017.
 */


/**
 * This class is a data-container for the remotes that are configured in the iOS app.
 * Remotes do not have states.
 * They can contain multiple Commands, which can contain multiple signal-IDs.
 */
export class Remote {

    public name: string;
    public commands: Command[];

    constructor(name: string) {
        this.name = name;
    }
}


export class Command {

    public name: string;
    public signal: number;
    public commands: Command[];

    constructor(name: string) {
        this.name = name;
    }

}