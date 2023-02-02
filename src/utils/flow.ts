interface Flow<T> {
	isLeft(): this is Left<T>;
	isRight(): this is Right<T>;
	get value(): T;
}

type Either<T, R> = NonNullable<Left<T> | Right<R>>;

class Left<T> implements Flow<T> {
	private _value: T;

	constructor(value: T) {
		this._value = value;
	}

	isLeft(): this is Left<T> {
		return true;
	}

	isRight(): this is Right<T> {
		return false;
	}

	get value(): T {
		return this._value;
	}
}

class Right<T> implements Flow<T> {
	private _value: T;

	constructor(value: T) {
		this._value = value;
	}

	isLeft(): this is Left<T> {
		return false;
	}

	isRight(): this is Right<T> {
		return true;
	}

	get value(): T {
		return this._value;
	}
}

function left<T>(value: T): Left<T> {
	return new Left(value);
}

function right<T>(value: T): Right<T> {
	return new Right(value);
}

export { left, right, type Right, type Left, type Either };
