export const DisplayLoadingSkeleton = (props) => {
    return(
        [...Array(20)].map((x, i) =>
            <div className="col" key={i}>
               <div className="card" style={{width: "14em"}}>
                <svg className="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>                  {/* <img src='https://via.placeholder.com/240x348' className="card-img-top img-thumbnail rounded" alt="Loading..." /> */}
                  <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                        <span className="placeholder col-8"></span>
                    </p>
                </div>
              </div>    
            </div>
        )
    )
}

export const RecomendationsLoading = props => {
    return(
        <div className="homeContainer"> 
        {[...Array(20)].map((x, i) =>
            <div className="col" key={i} style={{padding: "5px"}}>
                <div className="card" aria-hidden="true" style={{width: "14em"}}>
                <svg className="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>
                <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                    </p>
                </div>
                </div>  
            </div>
        )}
        </div>
    )
}