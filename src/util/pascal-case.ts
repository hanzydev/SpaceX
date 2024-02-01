import _ from 'lodash-es';

export const pascalCase = (str: string) => {
    return _.startCase(_.camelCase(str));
};
