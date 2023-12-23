export function Group(props) {
    return (
        <div className="group">
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},0,${props.species}`)}>
                0
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},1,${props.species}`)}>
                1
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},2,${props.species}`)}>
                2
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},3,${props.species}`)}>
                3
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},4,${props.species}`)}>
                4
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},5,${props.species}`)}>
                5
            </button>
            <button className="group-button" onClick={() => props.onClick(`${props.checklist},6,${props.species}`)}>
                6
            </button>
        </div>
    );
}