import { filter } from "rxjs/operators";

import { GraphQLResolveInfo, FieldNode } from "graphql";
import {
    getQueryData,
    getQueryDataFromFilters,
    GraphQLPartialResolveInfo
} from "../gql/utils";
import {
    getConnection,
    Brackets,
    WhereExpression,
    EntityManager,
    getManager
} from "typeorm";
import { populate } from "./populate";
import * as uuid from "uuid";
import { BaseModel } from "./models/base.model";

export interface IListQueryResult<T> {
    pageInfo: {
        total: number | Promise<number>;
    };
    result: T[] | Promise<T[]>;
}

export interface IListQueryResult<T> {
    pageInfo: {
        total: number | Promise<number>;
    };
    result: T[] | Promise<T[]>;
}
export interface IEntityResolver {
    /**
     * Reads the GraphQL info and criteria and creates the corresponding query builder
     *  */
    list(
        modelType: typeof BaseModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager
    ): Promise<IListQueryResult<BaseModel>>;

    /**
     * Reads the GraphQL info and criteria and creates the corresponding query builder
     * */
    list<TModel>(
        modelType: typeof BaseModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager
    ): Promise<IListQueryResult<TModel>>;
    /**
     * Reads the GraphQL info and creates the corresponding query builder for a single entity retrieval
     *  */

    find(
        id: number,
        modelType: typeof BaseModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        em?: EntityManager
    ): Promise<BaseModel | null>;
    /**
     * Reads the GraphQL info and creates the corresponding query builder for a single entity retrieval
     * */

    find<TModel>(
        id: number,
        modelType: typeof BaseModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        em?: EntityManager
    ): Promise<TModel | null>;
}

export const isPageInfoFieldNode = (node: FieldNode) => {
    return node.name.value === "pageInfo";
};

export const parseFilter = (filter: string): IFilterCriteria =>
    <IFilterCriteria>JSON.parse(filter);

export const criteriaToQbWhere = (
    prefix: string,
    qb: WhereExpression,
    filter: IFilterCriteria,
    type: "and" | "or" = "and"
): WhereExpression => {
    if (isQueryProperty(filter)) {
        let propPrefix = "";
        const criterion = <IPropertyFilterCriterion>filter;
        const dotSplitedProperty = criterion.property.split(".");
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
                prefix +
                "." +
                dotSplitedProperty[dotSplitedProperty.length - 1];
        }

        const operator = "=";
        const propUID = uuid.v1();
        if (type === "and") {
            return qb.andWhere(`${propName} ${operator} :${propUID}`, {
                [propUID]: criterion.value
            });
        } else {
            return qb.orWhere(`${propName} ${operator} :${propUID}`, {
                [propUID]: criterion.value
            });
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

export const EntityToGraphResolver: IEntityResolver = {
    list: async (
        modelType: typeof BaseModel,
        gqlQyeryInfo: GraphQLResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager
    ) => {
        try {
            const manager = em ?? getManager();
            const fieldsNode = <FieldNode>(
                gqlQyeryInfo.fieldNodes[0].selectionSet?.selections.find(
                    node => !isPageInfoFieldNode(<FieldNode>node)
                )
            );
            const fields = getQueryData(fieldsNode, modelType.getRelations());
            const modelAlias =
                modelType.name[0].toLowerCase() + modelType.name.substring(1);
            let qb = manager
                .getRepository(modelType)
                .createQueryBuilder(modelAlias)
                .select([
                    `${modelAlias}.id`,
                    ...fields.selectedFields.map(f => `${modelAlias}.${f}`)
                ]);

            if (criteria?.filter) {
                const filterParsed = parseFilter(criteria.filter);
                const queryDataFromFilters = getQueryDataFromFilters(
                    fields,
                    filterParsed,
                    modelType.getRelations()
                );
                queryDataFromFilters.relatedEntities?.map(relation => {
                    populate(modelAlias, qb, relation);
                });
                criteriaToQbWhere(modelAlias, qb, filterParsed);
            } else {
                fields.relatedEntities?.map(relation => {
                    populate(modelAlias, qb, relation);
                });
            }
            const total = qb.getCount();

            if (criteria?.max) {
                qb.take(criteria.max);
            }

            if (criteria?.skip) {
                if (!criteria?.max) {
                    qb.take(Math.pow(2, 32));
                }
                qb.skip(criteria.skip);
            }
            const result = qb.getMany();
            const pageInfo = { total };
            return { pageInfo, result };
        } catch (e) {
            console.log(e);
            throw e;
        }
    },
    find: async (
        id: number,
        modelType: typeof BaseModel,
        info: GraphQLResolveInfo,
        em?: EntityManager
    ) => {
        try {
            const manager = em ?? getManager();
            const fields = getQueryData(
                <FieldNode>info.fieldNodes[0],
                modelType.getRelations()
            );
            const modelAlias =
                modelType.name[0].toLowerCase() + modelType.name.substring(1);
            const qb = manager
                .getRepository(modelType)
                .createQueryBuilder(modelAlias)
                .select([
                    `${modelAlias}.id`,
                    ...fields.selectedFields.map(f => `${modelAlias}.${f}`)
                ])
                .where(`${modelAlias}.id = :id`, { id });

            fields.relatedEntities?.map(relation => {
                populate(modelAlias, qb, relation);
            });

            const result = await qb.getOne();
            return result ?? null;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
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
}

export type IFilterCriteria =
    | IPropertyFilterCriterion
    | IAndFilterCriteria
    | IOrFilterCriteria;
export interface IPropertyFilterCriterion {
    property: string;
    value: any;
    type: FilterTypesEnum;
}
export interface IAndFilterCriteria {
    and: IFilterCriteria[];
}

export interface IOrFilterCriteria {
    or: IFilterCriteria[];
}

export enum FilterTypesEnum {
    Equals = "eq"
}

export const isQueryOr = (criteria: IFilterCriteria) =>
    (<IOrFilterCriteria>criteria).or;

export const isQueryAnd = (criteria: IFilterCriteria) =>
    (<IAndFilterCriteria>criteria).and;

export const isQueryProperty = (criteria: IFilterCriteria) =>
    (<IPropertyFilterCriterion>criteria).property;
