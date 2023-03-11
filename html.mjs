export const get = (id) => document.getElementById(id);

const parse = (s) => {
    const [prefix, ...classes] = s.split('.');
    const [name, id] = prefix.split('#');

    return [
        name,
        id,
        classes
    ];
}

class ElBuilder {
    constructor(value) {
        const [name, id, classes] = parse(value);

        this._name = name;
        this._id = id;
        this._classes = classes;
    }

    id(value) {
        this._id = value;

        return this;
    }

    classes(value) {
        this._classes = value;

        return this;
    }

    attrs(value) {
        this._attrs = value;

        return this;
    }

    children(...value) {
        this._children = value;

        return this;
    }

    events(value) {
        this._events = value;

        return this;
    }

    build() {
        const el = document.createElement(this._name);

        if (this._id) el.id = this._id;

        for (let k in this._attrs) {
            el.setAttribute(k, this._attrs[k]);
        }

        if (typeof this._classes === 'string') {
            el.className = this._classes;
        } else if (Array.isArray(this._classes)) {
            this._classes.forEach((c) => {
                el.classList.add(c);
            });
        } else if (this._classes) { // object
            for (let k in this._classes) {
                el.classList.toggle(k, this._classes[k]);
            }
        }

        if (this._children) {
            if (this._children.length === 1 && typeof this._children[0] === 'string') {
                el.innerHTML = this._children[0];
            } else {
                this._children.forEach((child) => {
                    el.append(child.build());
                });
            }
        }

        for (let k in this._events) {
            el.addEventListener(k, this._events[k]);
        }

        return el;
    }
}

export const el = (name) => new ElBuilder(name);
