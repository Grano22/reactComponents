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
}

interface QuerySubcontainerProps {
    id?: string;
    className?: string;
    style?: CSSProperties;
    tagName?: string;
    children?: ReactNode;
    template?: (...args: any[])=>void;
}

/**
 * Query Container for rapid apollo client preparing
 */
const QueryContainer = (props: QueryContainerProps) : ReactElement<QuerySubcontainerProps> => {
    const { loading, error, data } = useQuery(props.passQuery);

    const TagName = props.tagName || "div";

    const filterContainer = (providenIC : ReactNode) : ReactNode[] => {
        let outputIC : ReactNode[] = [], iter = 0;
        React.Children.forEach(providenIC, (el : ReactNode)=>{
            if(!React.isValidElement(el)) return;
            if(loading) {
                if(el.type===QueryContainer.Loading) {
                    if(typeof el.props.template==="function") {
                        outputIC.push(el.props.template());
                    } else {
                        let elc = React.cloneElement(el, {
                            key:iter,
                            children:el.props.children
                        });
                        outputIC.push(elc);
                    }
                }
            } else if(error) {
                if(el.type===QueryContainer.Error) {
                    if(typeof el.props.template==="function") {
                        outputIC.push(el.props.template(error));
                    } else {
                        let elc = React.cloneElement(el, {
                            key:iter,
                            children:el.props.children
                        });
                        outputIC.push(elc);
                    }
                }
            } else if(el.type===QueryContainer.Result) {
                if(typeof el.props.template==="function") {
                    outputIC.push(el.props.template(data));
                } else {
                    let elc = React.cloneElement(el, {
                        key:iter,
                        children:el.props.children
                    });
                    outputIC.push(elc);
                }
            }
            iter++;
        });
        return outputIC;
    }

    return (
        <TagName id={props.id} className={props.className} style={props.style}>
            {filterContainer(props.children)}
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

export default QueryContainer;
