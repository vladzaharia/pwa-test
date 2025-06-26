import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Alert, AlertDescription } from './ui/alert'
import { Plus } from 'lucide-react'
import { TodoItem } from '../types'
import { cn } from '../lib/utils'
import { useIsMobile } from '../hooks/use-mobile'

interface TodoDemoProps {
  todos: TodoItem[]
  error: string | null
  isOnline: boolean
  addTodo: (title: string) => void
  toggleTodo: (id: number) => void
}

export function TodoDemo({
  todos,
  error,
  isOnline,
  addTodo,
  toggleTodo,
}: TodoDemoProps) {
  const [newTodo, setNewTodo] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useIsMobile()

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo)
      setNewTodo('')
      // On desktop, collapse after adding
      if (!isMobile) {
        setIsExpanded(false)
      }
    }
  }

  const handleInputFocus = () => {
    if (!isMobile) {
      setIsExpanded(true)
    }
  }

  const handleInputBlur = () => {
    // Only collapse if input is empty and not mobile
    if (!isMobile && !newTodo.trim()) {
      setIsExpanded(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Main Content - Responsive layout based on mobile/desktop and expansion state */}
      <div
        className={cn(
          'flex-1 flex gap-6 w-full min-h-0 transition-all duration-300',
          // Mobile: Always column layout
          isMobile && 'flex-col',
          // Desktop: Always row layout (horizontal)
          !isMobile && 'flex-row'
        )}
      >
        {/* Add Todo Section */}
        <div
          className={cn(
            'flex-shrink-0 transition-all duration-300',
            // Mobile: Full width
            isMobile && 'w-full',
            // Desktop: Expand to 2/3 when focused, compact when not
            !isMobile && (isExpanded ? 'w-2/3' : 'w-80')
          )}
        >
          <Card className="h-fit">
            <CardContent className="p-4 space-y-3">
              {/* Input section with conditional button */}
              <div
                className={cn(
                  'flex items-center h-10',
                  (isMobile || isExpanded) && 'gap-2'
                )}
              >
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done?"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="flex-1 h-10"
                />
                {/* Only show button and reserve space when needed */}
                {(isMobile || isExpanded) && (
                  <Button
                    onClick={handleAddTodo}
                    disabled={!newTodo.trim()}
                    size="sm"
                    className="h-10 w-10 p-0 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Todo List Section - Always visible */}
        <div
          className={cn(
            'flex-1 min-w-0 transition-all duration-300',
            // Desktop: Take remaining space (1/3 when expanded, rest when collapsed)
            !isMobile && isExpanded && 'w-1/3'
          )}
        >
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {todos.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-muted-foreground text-center">
                    {isOnline
                      ? 'No todos yet. Add your own!'
                      : 'No cached todos. Add some todos or go online!'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <div className="p-2 space-y-1">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center space-x-3 p-3 lg:p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => toggleTodo(todo.id)}
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => {}} // Prevent direct checkbox interaction
                        />
                        <span
                          className={cn(
                            'flex-1',
                            todo.completed &&
                              'line-through text-muted-foreground'
                          )}
                        >
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
