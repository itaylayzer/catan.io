import { VertexType } from "@/types/vertex";

export interface Edge {
    offset: number;
    color: VertexType;
    vertex: Vertex;
}
export interface Vertex {
    father?: Vertex;
    visited?: boolean;
    weight?: number;
    color: VertexType;
    harbor?: number;
    material?: {
        num: number;
        material: number;
    };
    edges: Map<number, Edge>;
}

export const GraphUtils = {
    join: (
        vertecies: Vertex[],
        from: number,
        to: number,
        color: VertexType.SETTLEMENT | VertexType.AREA
    ) => {
        vertecies[from].edges.set(to, {
            offset: to,
            vertex: vertecies[to],
            color: color,
        });
    },
};
