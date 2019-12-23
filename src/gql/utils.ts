import {
    IQueryData,
    IFilterCriteria,
    IPropertyFilterCriterion,
    isQueryProperty,
    isQueryOr,
    IOrFilterCriteria,
    isQueryAnd,
    IAndFilterCriteria
} from "../database/query-resolver";
import { ISubQueryData } from "./../database/query-resolver";
import { IRelationDefinition } from "../database/models/base.model";
import { FieldNode, GraphQLResolveInfo, SelectionNode } from "graphql";

/**
 *
 * Parses GraphQL Info object an converts to a tree like structure containing fields and entities
 * 
 * @param {FieldNode} info
 * @param {Array<IRelationDefinition>} relations
 * @returns {IQueryData}
 */
export const getQueryData = (
    info: FieldNode,
    relations: Array<IRelationDefinition>
): IQueryData => {
    const queryData: IQueryData = {
        selectedFields: [],
        relatedEntities: []
    };
    const allRequestedFields = <Array<string>>(
        info.selectionSet?.selections.map((f: any) => <string>f.name.value)
    );
    const mainEntityRequestedFields = allRequestedFields.filter(
        field => !relations.map(r => r.name).includes(field)
    );
    queryData.selectedFields = mainEntityRequestedFields;
    const relatedEntities = allRequestedFields.filter(field =>
        relations.map(r => r.name).includes(field)
    );

    if (relatedEntities?.length > 0) {
        relatedEntities.map(related => {
            const relatedInfo = (<Array<FieldNode>>(
                info.selectionSet?.selections
            )).find(
                (selection: FieldNode) => selection?.name.value === related
            );
            if (relatedInfo) {
                const relatedModel = relations.find(r => r.name === related);
                if (relatedModel) {
                    const relatedFieldsFromInfo = getQueryData(
                        relatedInfo,
                        relatedModel.model.getRelations()
                    );
                    const subqueryData: ISubQueryData = {
                        entityName: related,
                        data: relatedFieldsFromInfo
                    };
                    queryData.relatedEntities.push(subqueryData);
                }
            }
        });
    }
    return queryData;
};

export interface GraphQLPartialResolveInfo {
    fieldNodes: [
        {
            selectionSet: {
                selections: readonly SelectionNode[];
            };
        }
    ];
}

export const getInfoFromSubfield = (
    subfield: string,
    info: GraphQLResolveInfo
): GraphQLPartialResolveInfo => {
    const subnode = <FieldNode>(
        info.fieldNodes[0].selectionSet?.selections.find(
            node => (<FieldNode>node).name.value === subfield
        )
    );
    return {
        fieldNodes: [
            {
                selectionSet: {
                    selections: subnode.selectionSet?.selections ?? []
                }
            }
        ]
    };
};

export const getQueryDataFromFilters = (
    queryData: IQueryData | null,
    filter: IFilterCriteria,
    relations: Array<IRelationDefinition>,
    positionInsideProperty: number = 0
): IQueryData => {
    const data = queryData ?? {
        relatedEntities: [],
        selectedFields: []
    };

    const relationProperties = getAllPropertiesFromFilter(filter);
    const currentLevelProperties = Array.from(
        new Set(
            relationProperties
                .filter(
                    prop => prop.split(".").length >= positionInsideProperty + 1
                )
                .map(prop => prop.split(".")[positionInsideProperty])
        )
    );
    relations
        .filter(r => currentLevelProperties.includes(r.name))
        .map(r => {
            const existingRelation = data.relatedEntities.find(
                e => e.entityName === r.name
            );
            const subrelations = getQueryDataFromFilters(
                existingRelation?.data ?? null,
                filter,
                r.model.getRelations(),
                positionInsideProperty + 1
            );
            if (existingRelation) {
                const existingSubqueryData = existingRelation.data.relatedEntities.find(
                    sr => sr.entityName === r.name
                );
                if (existingSubqueryData) {
                    existingSubqueryData.data.relatedEntities = [
                        ...existingSubqueryData.data.relatedEntities,
                        ...subrelations.relatedEntities.filter(
                            sr =>
                                !existingSubqueryData.data.relatedEntities
                                    .map(en => en.entityName)
                                    .includes(sr.entityName)
                        )
                    ];
                }
            } else {
                const subqueryData: ISubQueryData = {
                    entityName: r.name,
                    data: subrelations
                };
                data.relatedEntities.push(subqueryData);
            }
        });
    return data;
};

export const getAllPropertiesFromFilter = (
    filter: IFilterCriteria
): Array<string> => {
    if (isQueryProperty(filter)) {
        const propFilter = <IPropertyFilterCriterion>filter;
        return [propFilter.property];
    } else if (isQueryOr(filter)) {
        const orFilter = <IOrFilterCriteria>filter;
        return [
            ...orFilter.or
                .map(getAllPropertiesFromFilter)
                .reduce((p, n) => p.concat(n), [])
        ];
    } else if (isQueryAnd(filter)) {
        const andFilter = <IAndFilterCriteria>filter;
        return [
            ...andFilter.and
                .map(getAllPropertiesFromFilter)
                .reduce((p, n) => p.concat(n), [])
        ];
    } else return [];
};
