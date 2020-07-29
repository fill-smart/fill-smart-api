import { BaseViewModel } from './models/base-view-model';
import { BaseModel } from "./models/base.model";
import {
    IQueryCriteria,
    isPageInfoFieldNode,
    parseFilter,
    parseSort,
    criteriaToQbWhere,
    criteriaToQbOrderBy
} from "./query-resolver";
import { populate } from "./populate";

import {
    GraphQLPartialResolveInfo,
    getQueryData,
    getQueryDataFromFilters
} from "../core/gql/utils";
import { GraphQLResolveInfo, FieldNode } from "graphql";

import { EntityManager, getManager, SelectQueryBuilder } from "typeorm";

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
        modelType: typeof BaseModel | typeof BaseViewModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager,
        inheritedQb?: SelectQueryBuilder<BaseModel>
    ): Promise<IListQueryResult<BaseModel | BaseViewModel>>;

    /**
     * Reads the GraphQL info and criteria and creates the corresponding query builder
     * */
    list<TModel>(
        modelType: typeof BaseModel | typeof BaseViewModel,
        info: GraphQLResolveInfo | GraphQLPartialResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager,
        inheritedQb?: SelectQueryBuilder<TModel>
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

export const EntityToGraphResolver: IEntityResolver = {
    list: async (
        modelType: typeof BaseModel | typeof BaseViewModel,
        gqlQyeryInfo: GraphQLResolveInfo,
        criteria?: IQueryCriteria,
        em?: EntityManager,
        inheritedQb?: SelectQueryBuilder<BaseModel | BaseViewModel>
    ) => {
        try {
            const manager = em ?? getManager();
            const fieldsNode = <FieldNode>(
                gqlQyeryInfo.fieldNodes[0].selectionSet?.selections.find(
                    node => !isPageInfoFieldNode(<FieldNode>node)
                )
            );
            const fields = getQueryData(fieldsNode, modelType);
            const modelAlias =
                inheritedQb?.alias ??
                modelType.name[0].toLowerCase() + modelType.name.substring(1);
            let queryBuilder =
                inheritedQb ??
                manager.getRepository(modelType).createQueryBuilder(modelAlias);

            if (queryBuilder instanceof BaseModel) {
                queryBuilder.select([
                    `${modelAlias}.id`,
                    ...fields.selectedFields.map(f => `${modelAlias}.${f}`)
                ]);
            }
            else {
                queryBuilder.select([
                    ...fields.selectedFields.map(f => `${modelAlias}.${f}`)
                ]);
            }


            const filterParsed = parseFilter(criteria?.filter ?? null);
            const sortParsed = parseSort(criteria?.sort ?? null);
            const queryDataFromFilters = getQueryDataFromFilters(
                fields,
                filterParsed,
                sortParsed,
                modelType.getRelations()
            );
            queryDataFromFilters.relatedEntities?.map(relation => {
                populate(modelAlias, queryBuilder, relation);
            });
            criteriaToQbWhere(modelAlias, queryBuilder, filterParsed);
            criteriaToQbOrderBy(modelAlias, queryBuilder, sortParsed);

            const total = queryBuilder.getCount();

            if (criteria?.max) {
                queryBuilder.take(criteria.max);
            }

            if (criteria?.skip) {
                if (!criteria?.max) {
                    queryBuilder.take(Math.pow(2, 32));
                }
                queryBuilder.skip(criteria.skip);
            }
            const result = queryBuilder.getMany();
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
                modelType
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
