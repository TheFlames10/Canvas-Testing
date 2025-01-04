// Shape class definition for managing individual shapes
class Shape {
    constructor(type, x, y, width, height, color) {
        this.type = type;    // 'rect' or 'circle'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isSelected = false;
    }

    // Draw the shape with selection highlighting if selected
    draw(ctx) {
        ctx.fillStyle = this.isSelected ? `${this.color}99` : this.color;
        ctx.strokeStyle = this.isSelected ? '#ff0000' : '#000000';
        ctx.lineWidth = this.isSelected ? 2 : 1;

        if (this.type === 'rect') {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2,
                this.y + this.height/2,
                Math.min(this.width, this.height)/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
        }
    }

    // Check if a point is inside the shape
    containsPoint(px, py) {
        if (this.type === 'rect') {
            return px >= this.x && px <= this.x + this.width &&
                   py >= this.y && py <= this.y + this.height;
        } else if (this.type === 'circle') {
            const cx = this.x + this.width/2;
            const cy = this.y + this.height/2;
            const radius = Math.min(this.width, this.height)/2;
            const dx = px - cx;
            const dy = py - cy;
            return (dx * dx + dy * dy) <= (radius * radius);
        }
        return false;
    }

    // Check if shape intersects with selection box
    intersectsBox(x1, y1, x2, y2) {
        const boxLeft = Math.min(x1, x2);
        const boxRight = Math.max(x1, x2);
        const boxTop = Math.min(y1, y2);
        const boxBottom = Math.max(y1, y2);

        if (this.type === 'rect') {
            return !(this.x + this.width < boxLeft || 
                    this.x > boxRight ||
                    this.y + this.height < boxTop || 
                    this.y > boxBottom);
        } else if (this.type === 'circle') {
            const cx = this.x + this.width/2;
            const cy = this.y + this.height/2;
            const radius = Math.min(this.width, this.height)/2;

            // Check if circle center is in box
            if (cx >= boxLeft && cx <= boxRight && 
                cy >= boxTop && cy <= boxBottom) {
                return true;
            }

            // Check distance to closest point on box
            const closestX = Math.max(boxLeft, Math.min(cx, boxRight));
            const closestY = Math.max(boxTop, Math.min(cy, boxBottom));
            const dx = cx - closestX;
            const dy = cy - closestY;
            return (dx * dx + dy * dy) <= (radius * radius);
        }
        return false;
    }
}

// CanvasManager class to handle all canvas operations
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // State management
        this.shapes = [];
        this.selectedShapes = [];
        this.isSelecting = false;
        this.isDragging = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionCurrent = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this._lastKeyEvent = null; // Track shift key state

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Set up event listeners
        this.setupEventListeners();
    }

    // Initialize event listeners
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        
        // Track shift key state
        window.addEventListener('keydown', (e) => this._lastKeyEvent = e);
        window.addEventListener('keyup', (e) => this._lastKeyEvent = e);
    }

    // Add a new shape to the canvas
    addShape(type, x, y, width, height, color) {
        const shape = new Shape(type, x, y, width, height, color);
        this.shapes.push(shape);
        this.draw();
    }

    // Clear all shapes from the canvas
    clearShapes() {
        this.shapes = [];
        this.selectedShapes = [];
        this.draw();
    }

    // Handle mouse down events for both click-selection and drag-selection
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if we clicked on any shape
        const clickedShape = this.shapes.find(shape => shape.containsPoint(x, y));

        if (clickedShape) {
            // If we clicked a shape
            if (e.shiftKey) {
                // Shift-click: Toggle selection of clicked shape
                this.toggleShapeSelection(clickedShape);
            } else {
                // Regular click: Select only this shape unless it's already selected
                if (!clickedShape.isSelected) {
                    this.clearSelection();
                    this.addToSelection(clickedShape);
                }
                this.isDragging = true;
            }
        } else {
            // Clicked empty space
            if (!e.shiftKey) {
                this.clearSelection();
            }
            this.isSelecting = true;
            this.selectionStart = { x, y };
            this.selectionCurrent = { x, y };
        }

        this.lastMousePos = { x, y };
        this.draw();
    }

    // Handle mouse movement for both dragging and selection box
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isSelecting) {
            this.selectionCurrent = { x, y };
            this.updateSelectionBox();
        } else if (this.isDragging) {
            const dx = x - this.lastMousePos.x;
            const dy = y - this.lastMousePos.y;
            this.moveSelectedShapes(dx, dy);
        }

        this.lastMousePos = { x, y };
        this.draw();
    }

    // Handle mouse up events
    handleMouseUp() {
        this.isSelecting = false;
        this.isDragging = false;
        this.draw();
    }

    // Toggle selection state of a shape
    toggleShapeSelection(shape) {
        if (shape.isSelected) {
            shape.isSelected = false;
            const index = this.selectedShapes.indexOf(shape);
            if (index > -1) {
                this.selectedShapes.splice(index, 1);
            }
        } else {
            shape.isSelected = true;
            this.selectedShapes.push(shape);
        }
    }

    // Add a shape to the selection
    addToSelection(shape) {
        if (!shape.isSelected) {
            shape.isSelected = true;
            this.selectedShapes.push(shape);
        }
    }

    // Clear all selections
    clearSelection() {
        this.selectedShapes.forEach(shape => shape.isSelected = false);
        this.selectedShapes = [];
    }

    // Remove a shape from selection
    removeFromSelection(shape) {
        if (shape.isSelected) {
            shape.isSelected = false;
            const index = this.selectedShapes.indexOf(shape);
            if (index > -1) {
                this.selectedShapes.splice(index, 1);
            }
        }
    }

    // Update shapes within selection box
    updateSelectionBox() {
        // When not holding shift, we'll manage a temporary selection set
        // that updates continuously as the selection box moves
        if (!this._lastKeyEvent?.shiftKey) {
            // First, clear any existing selection
            this.clearSelection();
        }

        // Check each shape against the current selection box
        this.shapes.forEach(shape => {
            const intersects = shape.intersectsBox(
                this.selectionStart.x, this.selectionStart.y,
                this.selectionCurrent.x, this.selectionCurrent.y
            );

            if (intersects) {
                // Add to selection if intersecting
                this.addToSelection(shape);
            } else if (!this._lastKeyEvent?.shiftKey) {
                // Remove from selection if not intersecting and not using shift
                this.removeFromSelection(shape);
            }
        });
    }

    // Move all selected shapes
    moveSelectedShapes(dx, dy) {
        this.selectedShapes.forEach(shape => {
            shape.x += dx;
            shape.y += dy;
        });
    }

    // Main draw function
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all shapes
        this.shapes.forEach(shape => shape.draw(this.ctx));

        // Draw selection box if selecting
        if (this.isSelecting) {
            this.ctx.strokeStyle = '#0066ff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                this.selectionStart.x,
                this.selectionStart.y,
                this.selectionCurrent.x - this.selectionStart.x,
                this.selectionCurrent.y - this.selectionStart.y
            );
            this.ctx.setLineDash([]);
        }
    }
}

// Export the classes for use in other files
export { Shape, CanvasManager };