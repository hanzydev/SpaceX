import _ from 'lodash';

export const pascalCase = (str: string) => {
    return _.startCase(_.camelCase(str));
};
