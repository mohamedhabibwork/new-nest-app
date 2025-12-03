import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateRange(
  startDateProperty: string,
  endDateProperty: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateRange',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [startDateProperty, endDateProperty],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [startDateProperty, endDateProperty] = args.constraints;
          const startDate = (args.object as any)[startDateProperty];
          const endDate = (args.object as any)[endDateProperty];

          if (!startDate || !endDate) {
            return true; // Skip validation if dates are not provided
          }

          const start = new Date(startDate);
          const end = new Date(endDate);

          return start <= end;
        },
        defaultMessage(args: ValidationArguments) {
          const [startDateProperty, endDateProperty] = args.constraints;
          return `${endDateProperty} must be after ${startDateProperty}`;
        },
      },
    });
  };
}

