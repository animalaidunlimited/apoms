export const isNil = (value:any): value is (null|undefined) => {
	return value === null || typeof(value) === 'undefined';
};

export const isObject = (value:any) : boolean => {
	return value && value.constructor === Object;
};

export const isBlank = (value: any): boolean =>{
	return isNil(value) ||
	(isObject(value) && Object.keys(value).length === 0) ||
	value.toString().trim() === '';
};

export const isPresent = (value: any): boolean => {
	return !isBlank(value);
};


