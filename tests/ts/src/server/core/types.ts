



export interface PaginatedObjects{
    num_results: number,
    num_pages: number,
    data: object[]
}

export interface PaginatedInstances<Model>{
    num_results: number,
    num_pages: number,
    data: Model[]
}
