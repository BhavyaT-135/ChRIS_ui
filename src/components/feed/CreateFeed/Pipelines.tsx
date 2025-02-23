import React, {  useContext } from "react";
import {
  Button,
  DataListContent,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  Pagination,
  DataListAction,
} from "@patternfly/react-core";

import { CreateFeedContext } from "./context";
import { Types } from "./types";
import { Tree, ConfigurationPage, UploadJson } from "../Pipelines/";
import {
  fetchComputeInfo,
  generatePipelineWithName,
  fetchPipelines,
} from "./utils/pipelines";
import {Pipeline, PipelinePipingDefaultParameterList} from '@fnndsc/chrisapi'

export interface UploadJsonProps {
  parameters: PipelinePipingDefaultParameterList,
  pluginPipings: any[]
  pipelinePlugins: any[]
  pipelineInstance: Pipeline
}


const Pipelines = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { pipelineData, selectedPipeline, pipelines } = state;

  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 5,
    search: "",
    itemCount: 0,
  });

  const [expanded, setExpanded] = React.useState<number[]>([]);
  const { page, perPage } = pageState;

  React.useEffect(() => {
    fetchPipelines(perPage, page).then((result: any) => {
      const { registeredPipelines, registeredPipelinesList } = result;
      if (registeredPipelines) {
        dispatch({
          type: Types.SetPipelines,
          payload: {
            pipelines: registeredPipelines,
          },
        });
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: registeredPipelinesList.totalCount,
          };
        });
      }
    });
  }, [perPage, page, dispatch]);

  const handleNodeClick = async (
    nodeName: number,
    pipelineId: number,
    plugin_id: number
  ) => {
    const { computeEnvs } = pipelineData[pipelineId];
    if (computeEnvs && !computeEnvs[nodeName]) {
      const computeEnvData = await fetchComputeInfo(plugin_id, nodeName);
      if (computeEnvData) {
        dispatch({
          type: Types.SetPipelineEnvironments,
          payload: {
            pipelineId,
            computeEnvData,
          },
        });
      }
    }

    dispatch({
      type: Types.SetCurrentNode,
      payload: {
        pipelineId,
        currentNode: nodeName,
      },
    });
  };

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };

  const handleDispatch = (result: UploadJsonProps) => {
    const { pipelineInstance, parameters, pluginPipings, pipelinePlugins } =
      result;
    dispatch({
      type: Types.AddPipeline,
      payload: {
        pipeline: pipelineInstance,
      },
    });

    dispatch({
      type: Types.SetPipelineResources,
      payload: {
        parameters,
        pluginPipings,
        pipelinePlugins,
      },
    });
  };

  return (
    <div className="pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl"> Registered Pipelines</h1>
        <UploadJson handleDispatch={handleDispatch} />
        <Pagination
          itemCount={pageState.itemCount}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
        />

        <DataList aria-label="pipeline list">
          {pipelines.length > 0 &&
            pipelines.map((pipeline) => {
              return (
                <DataListItem
                  isExpanded={expanded.includes(pipeline.data.id)}
                  key={pipeline.data.id}
                >
                  <DataListItemRow>
                    <DataListToggle
                      onClick={async () => {
                        if (!expanded.includes(pipeline.data.id)) {
                          const { resources } = await generatePipelineWithName(
                            pipeline.data.name
                          );

                          dispatch({
                            type: Types.SetExpandedPipelines,
                            payload: {
                              pipelineId: pipeline.data.id,
                            },
                          });

                          const { parameters, pluginPipings, pipelinePlugins } =
                            resources;

                          dispatch({
                            type: Types.SetPipelineResources,
                            payload: {
                              pipelineId: pipeline.data.id,
                              parameters,
                              pluginPipings,
                              pipelinePlugins,
                            },
                          });
                        }

                        const index = expanded.indexOf(pipeline.data.id);
                        const newExpanded =
                          index >= 0
                            ? [
                                ...expanded.slice(0, index),
                                ...expanded.slice(index + 1, expanded.length),
                              ]
                            : [...expanded, pipeline.data.id];
                        setExpanded(newExpanded);
                      }}
                      isExpanded={expanded.includes(pipeline.id)}
                      id={pipeline.id}
                      aria-controls="expand"
                    />
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={pipeline.data.name}>
                          <div
                            className="plugin-table-row"
                            key={pipeline.data.name}
                          >
                            <span className="plugin-table-row__plugin-name">
                              {pipeline.data.name}
                            </span>
                            <span
                              className="plugin-table-row__plugin-description"
                              id={`${pipeline.data.description}`}
                            >
                              <em>{pipeline.data.description}</em>
                            </span>
                          </div>
                        </DataListCell>,
                      ]}
                    />
                    <DataListAction
                      aria-labelledby="select a pipeline"
                      id={pipeline.data.id}
                      aria-label="actions"
                    >
                      <Button
                        variant="tertiary"
                        key="select-action"
                        onClick={async () => {
                          if (!(selectedPipeline === pipeline.data.id)) {
                            dispatch({
                              type: Types.SetCurrentPipeline,
                              payload: {
                                pipelineId: pipeline.data.id,
                              },
                            });

                            dispatch({
                              type: Types.SetPipelineName,
                              payload: {
                                pipelineName: pipeline.data.name,
                              },
                            });
                            if (!pipelineData[pipeline.data.id]) {
                              const { resources } =
                                await generatePipelineWithName(
                                  pipeline.data.name
                                );
                              const {
                                parameters,
                                pluginPipings,
                                pipelinePlugins,
                              } = resources;
                              dispatch({
                                type: Types.SetPipelineResources,
                                payload: {
                                  pipelineId: pipeline.data.id,
                                  parameters,
                                  pluginPipings,
                                  pipelinePlugins,
                                },
                              });
                            }
                          } else {
                            dispatch({
                              type: Types.DeslectPipeline,
                              payload: {},
                            });
                          }
                        }}
                      >
                        {selectedPipeline === pipeline.data.id
                          ? "Deselect"
                          : "Select"}
                      </Button>
                    </DataListAction>
                  </DataListItemRow>
                  <DataListContent
                    aria-label="PrimaryContent"
                    id={pipeline.data.id}
                    isHidden={!expanded.includes(pipeline.data.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                      }}
                    >
                      {expanded.includes(pipeline.data.id) ? (
                        <>
                          <Tree
                            currentPipelineId={pipeline.data.id}
                            handleNodeClick={handleNodeClick}
                          />
                          <ConfigurationPage
                            currentPipelineId={pipeline.data.id}
                          />
                        </>
                      ) : null}
                    </div>
                  </DataListContent>
                </DataListItem>
              );
            })}
        </DataList>
      </div>
    </div>
  );
};

export default Pipelines;
