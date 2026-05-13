export namespace models {
	
	export class Hero {
	    id: number;
	    shortName: string;
	    displayName: string;
	    attr: string;
	    roles: string[];
	
	    static createFrom(source: any = {}) {
	        return new Hero(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.shortName = source["shortName"];
	        this.displayName = source["displayName"];
	        this.attr = source["attr"];
	        this.roles = source["roles"];
	    }
	}

}

