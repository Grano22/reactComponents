import React from "react";
import QueryContainer from ".//QueryContainer";
import { gql } from "@apollo/client";

const fetchProgrammingLangs = gql`
    query {
        getProgrammingLangs {
           name
           icon
        }
    }
`

const Index = ()=>{

    return (
        <div>
          <h1>Języki programowania</h1>
          <QueryContainer id="inlineBoxesView" passQuery={fetchProgrammingLangs}>
              <QueryContainer.Loading>
                Ładowanie...
              </QueryContainer.Loading>
              <QueryContainer.Error template={(err)=>{
                  return <div>Err</div>;
              }}/>
              <QueryContainer.Result template={(res)=>{
                  console.log('cap res', res);

                  let nodes = [];

                  for(let plang in res.getProgrammingLangs) {
                      nodes.push(
                        <div key={plang}>
                           <span>{res.getProgrammingLangs[plang].icon}</span>
                           <span>{res.getProgrammingLangs[plang].name}</span>
                        </div>
                      );
                  }

                  return (
                    <div>
                       {nodes}
                    </div>
                  );
              }}/>
            </QueryContainer>
        </div>
    );

}
            
export default Index;
