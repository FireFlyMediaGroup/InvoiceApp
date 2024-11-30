'use client';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { POWRAFormData } from './POWRAFormData';

type Part4ReviewProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

const REVIEW_ROW_IDS = ['review-1', 'review-2', 'review-3', 'review-4'] as const;
type ReviewRowId = typeof REVIEW_ROW_IDS[number];

export default function Part4Review({
  formData,
  setFormData,
}: Part4ReviewProps) {
  console.log('Part4Review rendered with formData:', formData);

  const handleReviewChange = (id: ReviewRowId, field: 'name' | 'date', value: string) => {
    const index = REVIEW_ROW_IDS.indexOf(id);
    if (index === -1) {
      console.error(`Invalid review id: ${id}`);
      return;
    }

    setFormData((prev) => {
      let updatedData: POWRAFormData;
      if (field === 'name') {
        const updatedNames = [...prev.reviewNames];
        updatedNames[index] = value;
        updatedData = { ...prev, reviewNames: updatedNames };
      } else {
        const updatedDates = [...prev.reviewDates];
        updatedDates[index] = new Date(value);
        updatedData = { ...prev, reviewDates: updatedDates };
      }
      console.log(`Updated ${field} for review ${id}:`, updatedData);
      return updatedData;
    });
  };

  const handleLessonsLearnedChange = (checked: boolean) => {
    console.log('Lessons learned changed:', checked);
    setFormData((prev) => {
      const updatedData = { ...prev, lessonsLearned: checked };
      console.log('Updated formData:', updatedData);
      return updatedData;
    });
  };

  const handleReviewCommentsChange = (value: string) => {
    console.log('Review comments changed:', value);
    setFormData((prev) => {
      const updatedData = { ...prev, reviewComments: value || null };
      console.log('Updated formData:', updatedData);
      return updatedData;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-blue-500 text-white p-2 rounded">
          Part 4 - REVIEW
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REVIEW_ROW_IDS.map((id, index) => (
              <TableRow key={id}>
                <TableCell>
                  <Input
                    value={formData.reviewNames[index] || ''}
                    onChange={(e) => handleReviewChange(id, 'name', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={formData.reviewDates[index] ? formData.reviewDates[index].toISOString().split('T')[0] : ''}
                    onChange={(e) => handleReviewChange(id, 'date', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label>Are there any lessons for next time?</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lessons-learned"
                checked={formData.lessonsLearned}
                onCheckedChange={(checked) => handleLessonsLearnedChange(checked === true)}
              />
              <Label htmlFor="lessons-learned">Yes</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="review-comments">Comments</Label>
            <Textarea
              id="review-comments"
              placeholder="If Yes, comment below and inform your Chief Pilot / HSE Manager."
              value={formData.reviewComments || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleReviewCommentsChange(e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
