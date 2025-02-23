import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { tree, hierarchy } from "d3-hierarchy";
import { select } from "d3-selection";
import { Types } from "../CreateFeed/types";
import { CreateFeedContext } from "../CreateFeed/context";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import NodeData from "./NodeData";
import { TreeNode, getFeedTree } from "../../../utils";

const nodeSize = { x: 150, y: 50 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const translate = {
  x: 150,
  y: 50,
};
const scale = 1;

const Tree = (props: {
  currentPipelineId: number;
  handleNodeClick: (
    nodeName: number,
    pipelineId: number,
    plugin_id: number
  ) => void;
}) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { currentPipelineId } = props;
  const { pluginPipings, pipelinePlugins } =
    state.pipelineData[currentPipelineId];
  const [loading, setLoading] = React.useState(false);

  const { handleNodeClick } = props;

  const [data, setData] = React.useState<TreeNode[]>();

  React.useEffect(() => {
    if (pluginPipings) {
      setLoading(true);
      const tree = getFeedTree(pluginPipings);
      setData(tree);
    }
    if (pipelinePlugins) {
      const defaultPlugin = pipelinePlugins[0];
      const defaultPluginId = pluginPipings?.filter((piping) => {
        if (piping.data.plugin_id === defaultPlugin.data.id) {
          return piping.data.id;
        }
      });

      if (defaultPluginId) {
        dispatch({
          type: Types.SetCurrentNode,
          payload: {
            pipelineId: currentPipelineId,
            currentNode: defaultPluginId[0].data.id,
          },
        });
      }
    }
    setLoading(false);
  }, [pluginPipings, dispatch, pipelinePlugins, currentPipelineId]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes;
    let links = undefined;
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
    }
    return { nodes, links };
  };

  const { nodes, links } = generateTree();

  return (
    <div
      style={{
        width: "65%",
        height: "400px",
      }}
    >
      {loading ? (
        <span style={{ color: "black" }}>Fetching Pipeline.....</span>
      ) : (
        <svg className={`${svgClassName}`} width="100%" height="100%">
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => {
              return (
                <LinkData
                  orientation="vertical"
                  key={"link" + i}
                  linkData={linkData}
                />
              );
            })}
            {nodes?.map(({ data, x, y, parent }, i) => {
              return (
                <NodeData
                  key={`node + ${i}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  orientation="vertical"
                  handleNodeClick={handleNodeClick}
                  currentPipelineId={currentPipelineId}
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      )}
    </div>
  );
};
interface LinkProps {
  linkData: any;
  key: string;
  orientation: "vertical";
}

type LinkState = {
  initialStyle: {
    opacity: number;
  };
};

const LinkData: React.FC<LinkProps> = ({ linkData, orientation }) => {
  const linkRef = useRef<SVGPathElement | null>(null);
  const [initialStyle] = useState<LinkState["initialStyle"]>({ opacity: 1 });
  const nodeRadius = 12;

  useEffect(() => {
    applyOpacity(1, 0);
  }, []);

  const applyOpacity = (
    opacity: number,
    transitionDuration: number,
    done = () => {
      return null;
    }
  ) => {
    select(linkRef.current).style("opacity", opacity).on("end", done);
  };

  const drawPath = () => {
    const { source, target } = linkData;

    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = nodeRadius,
      targetPadding = nodeRadius + 4,
      sourceX = source.x + sourcePadding * normX,
      sourceY = source.y + sourcePadding * normY,
      targetX = target.x - targetPadding * normX,
      targetY = target.y - targetPadding * normY;

    //@ts-ignore

    return orientation === "horizontal"
      ? `M ${sourceY} ${sourceX} L ${targetY} ${targetX}`
      : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };

  return (
    <Fragment>
      <path
        ref={linkRef}
        className="link"
        d={drawPath()}
        style={{ ...initialStyle }}
        data-source-id={linkData.source.id}
        data-target-id={linkData.target.id}
      />
    </Fragment>
  );
};

export default Tree;
