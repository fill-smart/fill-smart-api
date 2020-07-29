import { BaseViewModel } from './models/base-view-model';
import { FieldNode } from "graphql";
import { Brackets, WhereExpression, SelectQueryBuilder } from "typeorm";
import * as uuid from "uuid";
import { BaseModel } from "./models/base.model";

export const isPageInfoFieldNode = (node: FieldNode) => {
    return node.name.value === "pageInfo";
};

export const parseFilter = (filter: string | null): IFilterCriteria | null =>
    filter ? <IFilterCriteria>JSON.parse(filter) : null;

export const parseSort = (sort: string | null): ISortCriteria | null =>
    sort ? <ISortCriteria>JSON.parse(sort) : null;

export const criteriaToQbWhere = (
    prefix: string,
    qb: WhereExpression,
    filter: IFilterCriteria | null,
    type: "and" | "or" = "and"
): WhereExpression => {
    if (!filter) return qb;
    if (isQueryProperty(filter)) {
        const criterion = <IPropertyFilterCriterion>filter;
        const propName = dotSplitedPropToQbAlias(criterion.property, prefix);
        console.log(criterion);
        const operator = criterion.type;
        const propUID = uuid.v1();
        let expression: string = "";
        let values: { [prop: string]: any } = {};
        switch (operator) {
            case FilterTypesEnum.Between:
                expression = `${propName} between :${propUID}From and :${propUID}To `;
                values = {
                    [`${propUID}From`]: criterion.value.from,
                    [`${propUID}To`]: criterion.value.to
                };
                break;
            case FilterTypesEnum.Equals:
                expression = `${propName} = :${propUID}`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.NotEquals:
                expression = `${propName} != :${propUID}`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.IsNull:
                expression = `${propName} is null`;
                break;
            case FilterTypesEnum.IsNotNull:
                expression = `${propName} is not null`;
                break;
            case FilterTypesEnum.GreatherThan:
                expression = `${propName} > :${propUID}`;
                values = { [propUID]: criterion.value };
            case FilterTypesEnum.GreatherThanEquals:
                expression = `${propName} >= :${propUID}`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.LowerThan:
                expression = `${propName} < :${propUID}`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.LowerThanEquals:
                expression = `${propName} <= :${propUID}`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.In:
                expression = `${propName} IN (:...${propUID})`;
                values = { [propUID]: criterion.value };
                break;
            case FilterTypesEnum.Like:
                expression = `${propName} like :${propUID}`;
                values = { [propUID]: "%" + criterion.value + "%" };
                break;
            default:
                throw "Invalid operator";
        }
        console.log(expression, values);
        if (type === "and") {
            return qb.andWhere(expression, values);
        } else {
            return qb.orWhere(expression, values);
        }
    } else if (isQueryOr(filter)) {
        const orCriteria = <IOrFilterCriteria>filter;
        if (type === "and") {
            return qb.andWhere(
                new Brackets(bqb => {
                    orCriteria.or.map(criterion =>
                        criteriaToQbWhere(prefix, bqb, criterion, "or")
                    );
                })
            );
        } else {
            return qb.orWhere(
                new Brackets(bqb => {
                    orCriteria.or.map(criterion =>
                        criteriaToQbWhere(prefix, bqb, criterion, "or")
                    );
                })
            );
        }
    } else if (isQueryAnd(filter)) {
        const andCriteria = <IAndFilterCriteria>filter;
        if (type === "and") {
            return qb.andWhere(
                new Brackets(bqb => {
                    andCriteria.and.map(criterion =>
                        criteriaToQbWhere(prefix, bqb, criterion)
                    );
                })
            );
        } else {
            return qb.orWhere(
                new Brackets(bqb => {
                    andCriteria.and.map(criterion =>
                        criteriaToQbWhere(prefix, bqb, criterion)
                    );
                })
            );
        }
    } else {
        return qb;
    }
};

export const criteriaToQbOrderBy = (
    prefix: string,
    qb: SelectQueryBuilder<BaseModel | BaseViewModel>,
    sort: ISortCriteria | null
): SelectQueryBuilder<BaseModel | BaseViewModel> => {
    if (!sort) return qb;
    sort.map(criterion => {
        const propName = dotSplitedPropToQbAlias(criterion.property, prefix);
        qb.addOrderBy(propName, criterion.descending ? "DESC" : "ASC");
    });
    return qb;
};

export const dotSplitedPropToQbAlias = (
    prop: string,
    prefix: string
): string => {
    let propPrefix = "";
    const dotSplitedProperty = prop.split(".");
    let propName = "";
    if (dotSplitedProperty.length > 1) {
        propPrefix =
            dotSplitedProperty
                .slice(0, dotSplitedProperty.length - 1)
                .join("") + ".";
        propName =
            prefix +
            propPrefix +
            dotSplitedProperty[dotSplitedProperty.length - 1];
    } else {
        propName =
            prefix + "." + dotSplitedProperty[dotSplitedProperty.length - 1];
    }
    return propName;
};

export interface ISubQueryData {
    entityName: string;
    data: IQueryData;
}

export interface IQueryData {
    selectedFields: Array<string>;
    relatedEntities: Array<ISubQueryData>;
}

export interface IQueryCriteria {
    skip?: number;
    max?: number;
    filter: string | null;
    sort: string | null;
}

export type IFilterCriteria =
    | IPropertyFilterCriterion
    | IAndFilterCriteria
    | IOrFilterCriteria;
export interface IPropertyFilterCriterion {
    property: string;
    value: { from: Date | number; to: Date | number } | any;
    type: FilterTypesEnum;
}
export interface IAndFilterCriteria {
    and: IFilterCriteria[];
}

export interface IOrFilterCriteria {
    or: IFilterCriteria[];
}

export enum FilterTypesEnum {
    Equals = "eq",
    IsNull = "null",
    IsNotNull = "not_null",
    GreatherThan = "gt",
    GreatherThanEquals = "gte",
    LowerThan = "lt",
    LowerThanEquals = "lte",
    NotEquals = "neq",
    Between = "btw",
    In = "in",
    Like = "like"
}

export const isQueryOr = (criteria: IFilterCriteria) =>
    (<IOrFilterCriteria>criteria).or;

export const isQueryAnd = (criteria: IFilterCriteria) =>
    (<IAndFilterCriteria>criteria).and;

export const isQueryProperty = (criteria: IFilterCriteria) =>
    (<IPropertyFilterCriterion>criteria).property;

export interface ISortCriterion {
    property: string;
    descending?: boolean;
}

export interface ISortCriteria extends Array<ISortCriterion> { }
