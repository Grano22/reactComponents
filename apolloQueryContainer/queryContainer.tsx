import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { gql, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';

interface QueryContainerProps {
    passQuery: DocumentNode;
    id?: string;
    className?: string;
    style?: CSSProperties;
    tagName?: string;
    children: ReactNode;
    waitFor: any[];
}

interface QuerySubcontainerProps {
    id?: string;
    className?: string;
    style?: CSSProperties;
    tagName?: string;
    children?: ReactNode;
    template?: (...args: any[])=>void;
}

const checkIfNullable = (queryRes : any) : boolean => {
    for(let queryName in queryRes) {
        if(queryRes[queryName]!==null) return false;
    }
    return true;
}

const checkIfReady = (varsMap : any[]) : boolean =>{
    for(let varName in varsMap) if(typeof varsMap[varName]==="undefined" || varsMap[varName]===null) return false;
    return true;
}

/**
 * Query Container for rapid apollo client preparing
 */
const QueryContainer = (props: QueryContainerProps) : ReactElement<QueryContainerProps> => {
    const typeStates = {
        loading: QueryContainer.Loading,
        error: QueryContainer.Error,
        result: QueryContainer.Result,
        nullable: QueryContainer.Nullable
    };
    const TagName = props.tagName || "div";
    let currState = "loading", args = [];
    let totalLoaded = typeof props.waitFor==="object" ? checkIfReady(props.waitFor) : true;
    if(totalLoaded) {
        const { loading, error, data } = useQuery(props.passQuery);
        if(error) { currState = "error"; args[0] = error; }
        else if(!loading) {
            if(checkIfNullable(data)) {
                currState = "nullable";
            } else currState = "result";
            args[0] = data;
        }
    }
    const filterContainer = (providenIC : ReactNode, typeState="loading", argv: any[]) : ReactNode[] => {
        let outputIC : ReactNode[] = [], iter = 0;
        React.Children.forEach(providenIC, (el : ReactNode)=>{
            if(!React.isValidElement(el)) return;
            if(typeStates[typeState]===el.type) {
                let elc = el;
                if(typeof el.props.template==="function") {
                    elc = el.props.template(...argv);
                }
                elc = React.cloneElement(elc, {
                    key:iter
                });
                outputIC.push(elc);
            }
            iter++;
        });
        return outputIC;
    }

    return (
        <TagName id={props.id} className={props.className} style={props.style}>
            {filterContainer(props.children, currState, args)}
        </TagName>
    )
}

/**
 * QueryContainer - Loading Template
 */
QueryContainer.Loading = (props: QuerySubcontainerProps) : ReactElement<QuerySubcontainerProps> => {
    const TagName = props.tagName || React.Fragment;

    return (
        <TagName>
            {props.children}
        </TagName>
    );
}

/**
 * QueryContainer - Error Template
 */
QueryContainer.Error = (props: QuerySubcontainerProps) : ReactElement<QuerySubcontainerProps> => {
    const TagName = props.tagName || React.Fragment;

    return (
        <TagName>
            {props.children}
        </TagName>
    );
}

/**
 * QueryContainer - Result Template
 */
QueryContainer.Result = (props: QuerySubcontainerProps) : ReactElement<QuerySubcontainerProps> => {
    const TagName = props.tagName || React.Fragment;

    return (
        <TagName>
            {props.children}
        </TagName>
    );
}

/**
 * QueryContainer - null result
 */
QueryContainer.Nullable = (props: QuerySubcontainerProps) : ReactElement<QuerySubcontainerProps> => {
    const TagName = props.tagName || React.Fragment;

    return (
        <TagName>
            {props.children}
        </TagName>
    );
}

export default QueryContainer;
