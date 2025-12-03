import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEnumValue(
  enumObject: object,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnumValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [enumObject],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumObject] = args.constraints;
          const enumValues = Object.values(enumObject);
          return enumValues.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const [enumObject] = args.constraints;
          const enumValues = Object.values(enumObject);
          return `${args.property} must be one of: ${enumValues.join(', ')}`;
        },
      },
    });
  };
}

